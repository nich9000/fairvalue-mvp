// Pulls real, live listings from Empire Flippers' public Marketplace API
// (https://empireflippers.com/marketplace-api/ — no auth required, sanctioned for third-party
// use, rate-limited to 1 req/sec) and replaces the empire_flippers rows in marketplace_listings
// with them. Flippa/Proprietor rows are untouched — see README for why those aren't live yet
// (Flippa's ToS prohibits scraping and has no public listings API; "Proprietor" turned out not
// to be a relevant/active marketplace at all).
//
// Run with: npm run fetch:ef

import { supabase } from './supabase';
import { computeCompositeScore, computeGrowthScore, computeRiskScore, computeValueScore, mean, median, stdDev } from '../services/dealScoring';

const API_BASE = 'https://api.empireflippers.com/api/v1/listings/list';
const PAGE_SIZE = 100;
const RATE_LIMIT_MS = 1100; // stay under EF's documented 1 req/sec

// Empire Flippers' "physical_product_monetizations" grouping — the subset of their broader
// catalog (which also includes SaaS, content, agencies, etc.) that matches this app's scope.
const ECOMMERCE_MONETIZATIONS = new Set(['eCommerce', 'Amazon FBA', 'Amazon FBM', 'DropShipping', 'Subscription-Box']);

const TRAFFIC_CHANNEL_MAP: Record<string, string> = {
  'Organic Search': 'organic',
  'Organic Social': 'organic',
  'Organic Shopping': 'organic',
  'Organic Video': 'organic',
  'Paid Search': 'paid_ads',
  'Paid Social': 'paid_ads',
  'Paid Shopping': 'paid_ads',
  'Paid Video': 'paid_ads',
  'Paid Other': 'paid_ads',
  Display: 'paid_ads',
  'Cross-network': 'paid_ads',
  Email: 'email_marketing',
  SMS: 'email_marketing',
  Direct: 'direct_sales',
};

interface EFSite {
  platform: string;
  position: number;
  discarded_at: string | null;
}

interface EFTrafficMonth {
  traffic_channels?: Record<string, { users_percentage: number }>;
}

interface EFListing {
  listing_number: number;
  public_title: string;
  average_monthly_net_profit: number | null;
  average_monthly_gross_revenue: number | null;
  listing_price: number;
  listing_multiple: number | null;
  listing_status: string;
  summary: string | null;
  profit_margin: number | null;
  gross_revenue_trend_percent: number | null;
  first_listed_at: string | null;
  monetizations: { monetization: string }[];
  niches: { niche: string }[];
  sites: EFSite[];
  combined_site_metrics?: EFTrafficMonth[];
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface EFListResponse {
  data: { listings: EFListing[]; pages: number };
}

async function fetchAllListings(): Promise<EFListing[]> {
  const all: EFListing[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await fetch(`${API_BASE}?limit=${PAGE_SIZE}&page=${page}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Empire Flippers API returned ${res.status} on page ${page}`);
    const body = (await res.json()) as EFListResponse;
    all.push(...body.data.listings);
    totalPages = body.data.pages;
    console.log(`Fetched page ${page}/${totalPages} (${body.data.listings.length} listings)`);
    page++;
    if (page <= totalPages) await sleep(RATE_LIMIT_MS);
  } while (page <= totalPages);

  return all;
}

function inferPlatform(monetizations: string[], sites: EFSite[]): string {
  const activeSites = sites.filter((s) => !s.discarded_at).sort((a, b) => a.position - b.position);
  const sitePlatform = activeSites[0]?.platform ?? 'Other';
  const hasFBA = monetizations.includes('Amazon FBA');
  const hasFBM = monetizations.includes('Amazon FBM');
  const hasShopifySite = activeSites.some((s) => s.platform === 'Shopify');

  if (hasFBA && hasShopifySite) return 'Amazon FBA / Shopify';
  if (hasFBA) return 'Amazon FBA';
  if (hasFBM) return 'Amazon FBM';
  return sitePlatform;
}

function inferFulfillmentModel(monetizations: string[]): string {
  if (monetizations.includes('Amazon FBA')) return 'FBA';
  if (monetizations.includes('DropShipping')) return 'dropshipping';
  if (monetizations.includes('Subscription-Box')) return 'subscription_box';
  return 'merchant_fulfilled';
}

function inferTrafficChannel(listing: EFListing): string {
  const months = listing.combined_site_metrics ?? [];
  const latest = months[months.length - 1];
  if (!latest?.traffic_channels) return 'organic';

  let best: [string, number] = ['organic', -1];
  for (const [rawChannel, data] of Object.entries(latest.traffic_channels)) {
    const mapped = TRAFFIC_CHANNEL_MAP[rawChannel];
    if (mapped && data.users_percentage > best[1]) best = [mapped, data.users_percentage];
  }
  return best[0];
}

function computeDataCompleteness(listing: EFListing): number {
  let score = 50;
  if (listing.summary) score += 15;
  if (listing.profit_margin != null) score += 10;
  if (listing.niches.length) score += 10;
  if (listing.combined_site_metrics?.length) score += 15;
  return Math.min(100, score);
}

function segmentKey(platform: string, fulfillment: string, traffic: string): string {
  return `${platform}|||${fulfillment}|||${traffic}`;
}

async function run() {
  console.log('Fetching live listings from Empire Flippers...');
  const raw = await fetchAllListings();
  console.log(`Fetched ${raw.length} total listings across all categories.`);

  // Include Sold listings, not just current For Sale ones — real closed prices are exactly
  // what comparable-sales analysis is built on, and it's the same sanctioned public endpoint.
  // Sold rows never surface in the main browse/search (that already filters to listing_status
  // = 'active'); they only feed the comparable-sales table and pricing-index medians, both of
  // which already query across all statuses with no other code changes needed.
  const RELEVANT_STATUSES = new Set(['For Sale', 'Pending Sold', 'Sold']);
  const relevant = raw.filter((l) => {
    if (!RELEVANT_STATUSES.has(l.listing_status)) return false;
    const monetizations = l.monetizations.map((m) => m.monetization);
    return monetizations.some((m) => ECOMMERCE_MONETIZATIONS.has(m));
  });
  const forSaleCount = relevant.filter((l) => l.listing_status !== 'Sold').length;
  const soldCount = relevant.filter((l) => l.listing_status === 'Sold').length;
  console.log(`${relevant.length} e-commerce-relevant listings (eCommerce/Amazon FBA/FBM/DropShipping/Subscription-Box): ${forSaleCount} for sale, ${soldCount} sold.`);

  const mapped = relevant
    .filter((l) => l.listing_price > 0 && l.average_monthly_gross_revenue && l.average_monthly_net_profit != null)
    .map((l) => {
      const monetizations = l.monetizations.map((m) => m.monetization);
      const annualRevenue = l.average_monthly_gross_revenue! * 12;
      const annualProfit = l.average_monthly_net_profit! * 12;
      return {
        external_id: `empire_flippers_${l.listing_number}`,
        source_marketplace: 'empire_flippers',
        source_url: `https://empireflippers.com/listing/${l.listing_number}`,
        listing_price: l.listing_price,
        annual_revenue: annualRevenue,
        annual_profit: annualProfit,
        // NOT l.listing_multiple — EF's field is price / *monthly* profit (a "months to
        // recoup" figure, e.g. 42), while multiple_achieved is price / annual profit
        // everywhere else in this app (e.g. 3.5x). Always derive it ourselves.
        multiple_achieved: l.listing_price / annualProfit,
        profit_margin_pct: l.profit_margin ?? (annualProfit / annualRevenue) * 100,
        growth_rate_yoy_pct: l.gross_revenue_trend_percent,
        platform: inferPlatform(monetizations, l.sites),
        niche_category: (l.niches[0]?.niche ?? 'general').toLowerCase(),
        fulfillment_model: inferFulfillmentModel(monetizations),
        traffic_channel: inferTrafficChannel(l),
        data_completeness_score: computeDataCompleteness(l),
        listed_date: l.first_listed_at ? l.first_listed_at.slice(0, 10) : null,
        // EF's public API doesn't expose an exact sold-date field — leaving this null rather
        // than approximating from updated_at, which isn't reliably the actual sale date.
        sold_date: null,
        listing_status: l.listing_status === 'Sold' ? 'sold' : 'active',
        description: l.summary,
      };
    });

  console.log(`${mapped.length} have complete enough data to ingest.`);

  console.log('Removing existing empire_flippers rows...');
  await supabase.from('marketplace_listings').delete().eq('source_marketplace', 'empire_flippers');

  console.log('Inserting live empire_flippers listings...');
  const { data: inserted, error: insertError } = await supabase.from('marketplace_listings').insert(mapped).select('id');
  if (insertError) {
    console.error('Failed to insert listings:', insertError.message);
    process.exit(1);
  }
  console.log(`Inserted ${inserted?.length ?? 0} live listings.`);

  // Recompute pricing index + rankings from the full current dataset (real EF rows plus
  // whatever Flippa/Proprietor sample rows remain), same methodology as seedListings.ts.
  // Paginated with .range() — PostgREST caps a single select() at 1000 rows by default, which
  // would silently drop ~10% of listings from the scoring pass with 1000+ total rows.
  console.log('Recomputing pricing index and rankings for the full dataset...');
  const allListings: any[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data: batch, error: fetchError } = await supabase
      .from('marketplace_listings')
      .select('*')
      .range(from, from + PAGE - 1);
    if (fetchError) {
      console.error('Failed to reload listings for scoring:', fetchError.message);
      process.exit(1);
    }
    if (!batch || batch.length === 0) break;
    allListings.push(...batch);
    if (batch.length < PAGE) break;
  }
  console.log(`Reloaded ${allListings.length} total listings for scoring.`);

  await supabase.from('deal_rankings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('marketplace_pricing_index').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const segments = new Map<string, typeof allListings>();
  for (const listing of allListings) {
    const key = segmentKey(listing.platform, listing.fulfillment_model, listing.traffic_channel);
    if (!segments.has(key)) segments.set(key, []);
    segments.get(key)!.push(listing);
  }

  const pricingIndexRows = [];
  const segmentMedians = new Map<string, number>();
  for (const [key, segmentListings] of segments) {
    const [platform, fulfillment_model, traffic_channel] = key.split('|||');
    const multiples = segmentListings.map((l) => Number(l.multiple_achieved));
    const medianMultiple = median(multiples);
    segmentMedians.set(key, medianMultiple);

    pricingIndexRows.push({
      platform,
      fulfillment_model,
      traffic_channel,
      niche_category: null,
      median_multiple: medianMultiple,
      mean_multiple: mean(multiples),
      std_dev_multiple: multiples.length > 1 ? stdDev(multiples) : 0,
      min_multiple: Math.min(...multiples),
      max_multiple: Math.max(...multiples),
      sample_size: multiples.length,
      sample_date: new Date().toISOString(),
    });
  }

  const { error: pricingError } = await supabase.from('marketplace_pricing_index').insert(pricingIndexRows);
  if (pricingError) {
    console.error('Failed to insert pricing index:', pricingError.message);
    process.exit(1);
  }
  console.log(`Inserted ${pricingIndexRows.length} pricing index segments.`);

  const rankingRows = allListings.map((listing) => {
    const key = segmentKey(listing.platform, listing.fulfillment_model, listing.traffic_channel);
    const segmentMedian = segmentMedians.get(key) ?? Number(listing.multiple_achieved);

    const valueScore = computeValueScore(segmentMedian, Number(listing.multiple_achieved));
    const qualityScore = listing.data_completeness_score;
    const growthScore = computeGrowthScore(listing.growth_rate_yoy_pct !== null ? Number(listing.growth_rate_yoy_pct) : null);
    const riskScore = computeRiskScore(listing.profit_margin_pct !== null ? Number(listing.profit_margin_pct) : null);
    const compositeScore = computeCompositeScore({ valueScore, qualityScore, growthScore, riskScore });

    return {
      listing_id: listing.id,
      value_score: valueScore,
      quality_score: qualityScore,
      growth_score: growthScore,
      risk_score: riskScore,
      composite_score: compositeScore,
    };
  });

  const { error: rankingError } = await supabase.from('deal_rankings').insert(rankingRows);
  if (rankingError) {
    console.error('Failed to insert deal rankings:', rankingError.message);
    process.exit(1);
  }
  console.log(`Inserted ${rankingRows.length} deal rankings.`);

  console.log('Done.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
