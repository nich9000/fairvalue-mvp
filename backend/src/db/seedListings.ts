import fs from 'fs';
import path from 'path';
import { supabase } from './supabase';
import { computeCompositeScore, computeGrowthScore, computeRiskScore, computeValueScore, mean, median, stdDev } from '../services/dealScoring';

interface ListingRow {
  listing_price: number;
  annual_revenue: number;
  annual_profit: number | null;
  multiple_achieved: number;
  platform: string;
  niche_category: string;
  fulfillment_model: string;
  traffic_channel: string;
  listed_date: string | null;
  sold_date: string | null;
  source_marketplace: string;
  listing_status: string;
  data_completeness_score: number;
  description: string;
}

function normalizeStatus(raw: string): string {
  const value = raw.trim().toLowerCase();
  if (value === 'sold' || value === 'completed') return 'sold';
  return 'active';
}

function parseDate(raw: string): string | null {
  const value = raw.trim();
  return value === '' || value.toUpperCase() === 'NULL' ? null : value;
}

function parseNumber(raw: string): number | null {
  const value = raw.trim();
  return value === '' || value.toUpperCase() === 'NULL' ? null : Number(value);
}

function parseCsv(filePath: string): ListingRow[] {
  const raw = fs.readFileSync(filePath, 'utf-8').trim();
  const [headerLine, ...lines] = raw.split(/\r?\n/);
  const headers = headerLine.split(',');

  return lines
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const cells = line.split(',');
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h.trim()] = (cells[i] ?? '').trim();
      });

      return {
        listing_price: Number(row.listing_price),
        annual_revenue: Number(row.annual_revenue),
        annual_profit: parseNumber(row.annual_profit),
        multiple_achieved: Number(row.multiple_achieved),
        platform: row.platform,
        niche_category: row.niche_category,
        fulfillment_model: row.fulfillment_model,
        traffic_channel: row.traffic_channel,
        listed_date: parseDate(row.listed_date),
        sold_date: parseDate(row.sold_date),
        source_marketplace: row.source_marketplace,
        listing_status: normalizeStatus(row.listing_status),
        data_completeness_score: Number(row.data_completeness_score),
        description: row.notes,
      };
    });
}

function segmentKey(platform: string, fulfillment: string, traffic: string): string {
  return `${platform}|||${fulfillment}|||${traffic}`;
}

async function seed() {
  const csvPath = path.join(__dirname, 'seed_data', 'marketplace_listings.csv');
  const rows = parseCsv(csvPath);
  console.log(`Parsed ${rows.length} marketplace listings from ${csvPath}`);

  // Clear in FK-safe order: deal_rankings cascades from marketplace_listings, pricing index is independent.
  await supabase.from('marketplace_pricing_index').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('marketplace_listings').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const inserts = rows.map((row, index) => ({
    external_id: `${row.source_marketplace}_${index + 1}`,
    source_marketplace: row.source_marketplace,
    listing_price: row.listing_price,
    annual_revenue: row.annual_revenue,
    annual_profit: row.annual_profit,
    multiple_achieved: row.multiple_achieved,
    profit_margin_pct: row.annual_profit !== null ? (row.annual_profit / row.annual_revenue) * 100 : null,
    platform: row.platform,
    niche_category: row.niche_category,
    fulfillment_model: row.fulfillment_model,
    traffic_channel: row.traffic_channel,
    data_completeness_score: row.data_completeness_score,
    listed_date: row.listed_date,
    sold_date: row.sold_date,
    listing_status: row.listing_status,
    description: row.description,
  }));

  const { data: listings, error: insertError } = await supabase.from('marketplace_listings').insert(inserts).select('*');
  if (insertError || !listings) {
    console.error('Failed to insert listings:', insertError?.message);
    process.exit(1);
  }
  console.log(`Inserted ${listings.length} listings.`);

  // Segment listings by platform + fulfillment + traffic for pricing index + ranking baselines.
  const segments = new Map<string, typeof listings>();
  for (const listing of listings) {
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

  const rankingRows = listings.map((listing) => {
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

  process.exit(0);
}

seed();
