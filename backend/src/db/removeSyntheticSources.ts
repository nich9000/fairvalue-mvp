// One-off cleanup: removes the Flippa/Proprietor synthetic sample rows now that Empire
// Flippers is the only real, live-sourced marketplace. Recomputes pricing index + rankings
// afterward so segment medians reflect only real data.
//
// Run with: npx ts-node src/db/removeSyntheticSources.ts

import { supabase } from './supabase';
import { computeCompositeScore, computeGrowthScore, computeRiskScore, computeValueScore, mean, median, stdDev } from '../services/dealScoring';

function segmentKey(platform: string, fulfillment: string, traffic: string): string {
  return `${platform}|||${fulfillment}|||${traffic}`;
}

async function run() {
  console.log('Removing synthetic flippa/proprietor rows...');
  const { error: deleteError, count } = await supabase
    .from('marketplace_listings')
    .delete({ count: 'exact' })
    .in('source_marketplace', ['flippa', 'proprietor']);
  if (deleteError) {
    console.error('Failed to delete synthetic rows:', deleteError.message);
    process.exit(1);
  }
  console.log(`Removed ${count ?? 0} synthetic rows.`);

  console.log('Recomputing pricing index and rankings for the remaining dataset...');
  const allListings: any[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data: batch, error: fetchError } = await supabase.from('marketplace_listings').select('*').range(from, from + PAGE - 1);
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
