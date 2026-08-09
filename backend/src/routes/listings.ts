import { Router } from 'express';
import { supabase } from '../db/supabase';
import { optionalAuth } from '../middleware/optionalAuth';
import { categoryBucket } from '../lib/categoryBucket';
import { expandPlatformDisplayNames, platformDisplayBuckets } from '../lib/platformGroups';

const router = Router();

const RISK_FACTOR_RULES: Array<{ test: (l: any) => boolean; text: string }> = [
  { test: (l) => l.fulfillment_model === 'FBA', text: 'Amazon FBA fees typically consume 30-40% of margin' },
  { test: (l) => l.fulfillment_model === 'dropshipping', text: 'Dropshipping margins are thinner and exposed to supplier price changes' },
  { test: (l) => l.traffic_channel === 'paid_ads', text: 'Revenue depends on paid ads — rising CPCs could compress margins' },
  { test: (l) => (l.data_completeness_score ?? 100) < 70, text: 'Limited seller-disclosed data — verify financials during due diligence' },
  { test: (l) => l.profit_margin_pct !== null && l.profit_margin_pct < 15, text: 'Thin margins increase sensitivity to cost or demand shocks' },
];

function buildRiskFactors(listing: any): string[] {
  return RISK_FACTOR_RULES.filter((rule) => rule.test(listing)).map((rule) => rule.text);
}

router.get('/', async (req, res) => {
  const { platform, niche, revenue_min, revenue_max, fulfillment, traffic, marketplace, category, multiple_min, multiple_max, sort, page, limit } =
    req.query;

  let query = supabase.from('marketplace_listings').select('*').eq('listing_status', 'active');

  // "|" not "," — several category bucket names (e.g. "Toys, Games & Hobbies") contain a
  // literal comma, which would otherwise collide with the multi-select join delimiter.
  if (platform) {
    const rawValues = expandPlatformDisplayNames((platform as string).split('|').filter(Boolean));
    if (rawValues.length) query = query.in('platform', rawValues);
  }
  if (niche) query = query.ilike('niche_category', `%${niche}%`);
  if (fulfillment) query = query.eq('fulfillment_model', fulfillment as string);
  if (traffic) query = query.eq('traffic_channel', traffic as string);
  if (revenue_min) query = query.gte('annual_revenue', Number(revenue_min));
  if (revenue_max) query = query.lte('annual_revenue', Number(revenue_max));
  if (multiple_min) query = query.gte('multiple_achieved', Number(multiple_min));
  if (multiple_max) query = query.lte('multiple_achieved', Number(multiple_max));
  if (marketplace) {
    const marketplaces = (marketplace as string).split('|').filter(Boolean);
    if (marketplaces.length) query = query.in('source_marketplace', marketplaces);
  }

  const { data: rawListings, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const { count: soldCount } = await supabase
    .from('marketplace_listings')
    .select('id', { count: 'exact', head: true })
    .eq('listing_status', 'sold');

  // categoryBucket() groups the free-text niche_category field into general buckets — there's
  // no DB column for it, so this filter is applied in JS after the Supabase query runs.
  let listings = rawListings ?? [];
  if (category) {
    const categories = (category as string).split('|').filter(Boolean);
    if (categories.length) listings = listings.filter((l) => categories.includes(categoryBucket(l.niche_category)));
  }

  // Marketplace/platform/category counts are shown as sidebar checkbox totals — computed over
  // all active listings regardless of the current filters, so counts stay stable as a user filters.
  const { data: allActive } = await supabase
    .from('marketplace_listings')
    .select('source_marketplace, platform, niche_category, annual_revenue')
    .eq('listing_status', 'active');
  const marketplaceCounts = new Map<string, number>();
  const platformCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  let revenueMin: number | null = null;
  let revenueMax: number | null = null;
  for (const row of allActive ?? []) {
    marketplaceCounts.set(row.source_marketplace, (marketplaceCounts.get(row.source_marketplace) ?? 0) + 1);
    for (const displayPlatform of platformDisplayBuckets(row.platform)) {
      platformCounts.set(displayPlatform, (platformCounts.get(displayPlatform) ?? 0) + 1);
    }
    const bucket = categoryBucket(row.niche_category);
    categoryCounts.set(bucket, (categoryCounts.get(bucket) ?? 0) + 1);
    const revenue = Number(row.annual_revenue);
    if (!Number.isNaN(revenue)) {
      revenueMin = revenueMin === null ? revenue : Math.min(revenueMin, revenue);
      revenueMax = revenueMax === null ? revenue : Math.max(revenueMax, revenue);
    }
  }
  // Sorted by count desc (name as tiebreaker) so checkbox order is deterministic across
  // requests — Supabase doesn't guarantee row order without an explicit .order(), and an
  // unstable sidebar order caused clicks to land on the wrong checkbox after a refetch.
  const byCountDesc = <T extends { count: number }>(a: T, b: T) => b.count - a.count;
  const marketplace_counts = Array.from(marketplaceCounts.entries())
    .map(([source_marketplace, count]) => ({ source_marketplace, count }))
    .sort((a, b) => byCountDesc(a, b) || a.source_marketplace.localeCompare(b.source_marketplace));
  const platform_counts = Array.from(platformCounts.entries())
    .map(([platform, count]) => ({ platform, count }))
    .sort((a, b) => byCountDesc(a, b) || a.platform.localeCompare(b.platform));
  const category_counts = Array.from(categoryCounts.entries())
    .map(([bucket, count]) => ({ bucket, count }))
    .sort((a, b) => byCountDesc(a, b) || a.bucket.localeCompare(b.bucket));

  const ids = listings.map((l) => l.id);
  const [{ data: rankings }, { data: segments }] = await Promise.all([
    supabase
      .from('deal_rankings')
      .select('listing_id, composite_score, value_score')
      .in('listing_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']),
    supabase.from('marketplace_pricing_index').select('platform, fulfillment_model, traffic_channel, median_multiple'),
  ]);

  const rankingMap = new Map((rankings ?? []).map((r) => [r.listing_id, r]));
  const segmentMap = new Map(
    (segments ?? []).map((s) => [`${s.platform}|||${s.fulfillment_model}|||${s.traffic_channel}`, s.median_multiple])
  );

  const merged = (listings ?? []).map((l) => {
    const ranking = rankingMap.get(l.id);
    const segmentKey = `${l.platform}|||${l.fulfillment_model}|||${l.traffic_channel}`;
    return {
      ...l,
      composite_score: ranking?.composite_score ?? null,
      value_score: ranking?.value_score ?? null,
      segment_median_multiple: segmentMap.get(segmentKey) ?? null,
    };
  });

  const sortKey = (sort as string) || 'deal_score';
  merged.sort((a, b) => {
    if (sortKey === 'revenue') return b.annual_revenue - a.annual_revenue;
    if (sortKey === 'price_desc') return b.listing_price - a.listing_price;
    if (sortKey === 'multiple_asc') return a.multiple_achieved - b.multiple_achieved;
    if (sortKey === 'multiple_desc') return b.multiple_achieved - a.multiple_achieved;
    if (sortKey === 'listed_date') return new Date(b.listed_date ?? 0).getTime() - new Date(a.listed_date ?? 0).getTime();
    return (b.composite_score ?? -Infinity) - (a.composite_score ?? -Infinity);
  });

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const start = (pageNum - 1) * limitNum;
  const paged = merged.slice(start, start + limitNum);

  const bySource = new Map<string, { count: number; totalMultiple: number }>();
  for (const l of merged) {
    const entry = bySource.get(l.source_marketplace) ?? { count: 0, totalMultiple: 0 };
    entry.count += 1;
    entry.totalMultiple += Number(l.multiple_achieved);
    bySource.set(l.source_marketplace, entry);
  }
  const source_breakdown = Array.from(bySource.entries()).map(([source_marketplace, { count, totalMultiple }]) => ({
    source_marketplace,
    count,
    avg_multiple: totalMultiple / count,
  }));

  res.json({
    listings: paged,
    total_count: merged.length,
    page: pageNum,
    total_pages: Math.max(1, Math.ceil(merged.length / limitNum)),
    has_next: start + limitNum < merged.length,
    source_breakdown,
    marketplace_counts,
    platform_counts,
    category_counts,
    revenue_range: revenueMin !== null && revenueMax !== null ? { min: revenueMin, max: revenueMax } : null,
    sold_count: soldCount ?? 0,
  });
});

router.get('/:id', optionalAuth, async (req, res) => {
  const { id } = req.params;

  const { data: listing, error } = await supabase.from('marketplace_listings').select('*').eq('id', id).maybeSingle();
  if (error || !listing) return res.status(404).json({ error: 'Listing not found' });

  const { data: ranking } = await supabase.from('deal_rankings').select('*').eq('listing_id', id).maybeSingle();

  const { data: segment } = await supabase
    .from('marketplace_pricing_index')
    .select('*')
    .eq('platform', listing.platform)
    .eq('fulfillment_model', listing.fulfillment_model)
    .eq('traffic_channel', listing.traffic_channel)
    .maybeSingle();

  const { data: comparableListings } = await supabase
    .from('marketplace_listings')
    .select('id, niche_category, source_marketplace, listing_price, annual_revenue, multiple_achieved')
    .eq('platform', listing.platform)
    .eq('fulfillment_model', listing.fulfillment_model)
    .eq('traffic_channel', listing.traffic_channel)
    .neq('id', id)
    .order('data_completeness_score', { ascending: false })
    .limit(3);

  let saved_by_user = false;
  if (req.user) {
    const { data: saved } = await supabase
      .from('user_saved_deals')
      .select('id')
      .eq('user_id', req.user.user_id)
      .eq('listing_id', id)
      .maybeSingle();
    saved_by_user = !!saved;
  }

  const improvementPotential = segment
    ? [
        {
          scenario: 'Reach this segment’s median multiple',
          potential_value: listing.annual_revenue * Number(segment.median_multiple),
        },
      ]
    : [];

  res.json({
    ...listing,
    deal_score: ranking?.composite_score ?? null,
    comparable_segment: segment ?? null,
    comparable_listings: comparableListings ?? [],
    risk_factors: buildRiskFactors(listing),
    improvement_potential: improvementPotential,
    saved_by_user,
  });
});

export default router;
