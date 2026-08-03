import { Router } from 'express';
import { supabase } from '../db/supabase';
import { optionalAuth } from '../middleware/optionalAuth';

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
  const { platform, niche, revenue_min, revenue_max, fulfillment, traffic, sort, page, limit } = req.query;

  let query = supabase.from('marketplace_listings').select('*').eq('listing_status', 'active');

  if (platform) query = query.eq('platform', platform as string);
  if (niche) query = query.ilike('niche_category', `%${niche}%`);
  if (fulfillment) query = query.eq('fulfillment_model', fulfillment as string);
  if (traffic) query = query.eq('traffic_channel', traffic as string);
  if (revenue_min) query = query.gte('annual_revenue', Number(revenue_min));
  if (revenue_max) query = query.lte('annual_revenue', Number(revenue_max));

  const { data: listings, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const ids = (listings ?? []).map((l) => l.id);
  const { data: rankings } = await supabase
    .from('deal_rankings')
    .select('listing_id, composite_score')
    .in('listing_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);

  const rankingMap = new Map((rankings ?? []).map((r) => [r.listing_id, r.composite_score]));
  const merged = (listings ?? []).map((l) => ({ ...l, composite_score: rankingMap.get(l.id) ?? null }));

  const sortKey = (sort as string) || 'deal_score';
  merged.sort((a, b) => {
    if (sortKey === 'revenue') return b.annual_revenue - a.annual_revenue;
    if (sortKey === 'listed_date') return new Date(b.listed_date ?? 0).getTime() - new Date(a.listed_date ?? 0).getTime();
    return (b.composite_score ?? -Infinity) - (a.composite_score ?? -Infinity);
  });

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const start = (pageNum - 1) * limitNum;
  const paged = merged.slice(start, start + limitNum);

  res.json({
    listings: paged,
    total_count: merged.length,
    page: pageNum,
    has_next: start + limitNum < merged.length,
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
    risk_factors: buildRiskFactors(listing),
    improvement_potential: improvementPotential,
    saved_by_user,
  });
});

export default router;
