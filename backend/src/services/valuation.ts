import { supabase } from '../db/supabase';
import { MarketplaceListing, StoreInput, ValuationResult } from '../types';
import { expandPlatformDisplayNames } from '../lib/platformGroups';
import { computeImprovementOpportunities } from './metrics';

// All multiples here are price / annual profit — the same definition marketplace_listings
// uses (see fetchEmpireFlippers.ts) and the one buyers quote ("3.2x SDE").
const DEFAULT_BASE_MULTIPLE = 2.5;
const MIN_MULTIPLE = 1.5;
const MAX_MULTIPLE = 6.0;
const MIN_COMPS_FOR_MEDIAN = 5;
const MAX_COMPS = 50;

// Comps outside this band are almost always data errors (near-zero profit blowing up the
// ratio), and would drag the median around in thin segments.
const SANE_MULTIPLE_LOW = 0.5;
const SANE_MULTIPLE_HIGH = 15;

// Unprofitable stores can't be valued on a profit multiple. Fall back to the comps' price /
// revenue median, discounted because a buyer is paying for revenue they still have to turn
// into profit (data model v3's "revenue fallback").
const UNPROFITABLE_REVENUE_DISCOUNT = 0.6;

type CompRow = Pick<MarketplaceListing, 'listing_price' | 'annual_revenue' | 'annual_profit' | 'multiple_achieved' | 'platform'>;

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

async function queryComps(annualRevenue: number, platforms: string[] | null): Promise<CompRow[]> {
  let query = supabase
    .from('marketplace_listings')
    .select('listing_price, annual_revenue, annual_profit, multiple_achieved, platform')
    .gt('annual_profit', 0)
    .gte('multiple_achieved', SANE_MULTIPLE_LOW)
    .lte('multiple_achieved', SANE_MULTIPLE_HIGH)
    .gte('annual_revenue', annualRevenue * 0.5)
    .lte('annual_revenue', annualRevenue * 2)
    .limit(500);
  if (platforms) query = query.in('platform', platforms);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to query comparable listings: ${error.message}`);
  return (data ?? []) as CompRow[];
}

// Closest-in-size comps first: a $300k-revenue store is better compared to $250k-$400k
// businesses than to the edges of the 0.5x-2x band.
export function closestBySize(comps: CompRow[], annualRevenue: number): CompRow[] {
  const distance = (c: CompRow) => Math.abs(Math.log(Number(c.annual_revenue) / annualRevenue));
  return [...comps].sort((a, b) => distance(a) - distance(b)).slice(0, MAX_COMPS);
}

// Real Empire Flippers listings (For Sale + Sold) on the same platform and similar revenue.
// Falls back to all platforms when the platform segment is too thin to take a median from.
async function findComparables(platform: string, annualRevenue: number): Promise<CompRow[]> {
  const samePlatform = await queryComps(annualRevenue, expandPlatformDisplayNames([platform]));
  if (samePlatform.length >= MIN_COMPS_FOR_MEDIAN) return closestBySize(samePlatform, annualRevenue);
  return closestBySize(await queryComps(annualRevenue, null), annualRevenue);
}

export function calculateBaseMultiple(comps: CompRow[]): number {
  if (comps.length < MIN_COMPS_FOR_MEDIAN) return DEFAULT_BASE_MULTIPLE;
  return median(comps.map((c) => Number(c.multiple_achieved)));
}

export function calculateConfidenceScore(numComps: number, basis: ValuationResult['valuation_basis']): number {
  const score = numComps >= 20 ? 92 : numComps >= 10 ? 85 : numComps >= 5 ? 78 : 65;
  return basis === 'revenue_fallback' ? Math.min(score, 60) : score;
}

function clampMultiple(multiple: number): number {
  return Math.min(MAX_MULTIPLE, Math.max(MIN_MULTIPLE, multiple));
}

export function valueFromComps(store: StoreInput, comps: CompRow[]) {
  const baseMultiple = calculateBaseMultiple(comps);

  const adjustmentRetention = (store.customer_retention_pct - 60) * 0.05;
  const adjustmentGrowth = (store.growth_rate_yoy_pct - 10) * 0.03;
  const adjustmentMargin = (store.gross_margin_pct - 40) * 0.02;
  const adjustmentRecurring = store.recurring_revenue_pct * 0.02;

  const rawAdjustedMultiple =
    baseMultiple * (1 + adjustmentRetention + adjustmentGrowth + adjustmentMargin + adjustmentRecurring);
  const adjustedMultiple = clampMultiple(rawAdjustedMultiple);

  if (store.annual_profit > 0) {
    return {
      base_multiple: baseMultiple,
      adjusted_multiple: adjustedMultiple,
      base_valuation: store.annual_profit * adjustedMultiple,
      valuation_basis: 'profit' as const,
    };
  }

  const revenueMultiples = comps.map((c) => Number(c.listing_price) / Number(c.annual_revenue));
  const revenueMultiple = revenueMultiples.length ? median(revenueMultiples) : 0.5;
  return {
    base_multiple: baseMultiple,
    adjusted_multiple: adjustedMultiple,
    base_valuation: store.annual_revenue * revenueMultiple * UNPROFITABLE_REVENUE_DISCOUNT,
    valuation_basis: 'revenue_fallback' as const,
  };
}

export async function calculateValuation(store: StoreInput): Promise<ValuationResult> {
  const comps = await findComparables(store.platform, store.annual_revenue);
  const { base_multiple, adjusted_multiple, base_valuation, valuation_basis } = valueFromComps(store, comps);

  return {
    base_multiple,
    adjusted_multiple,
    base_valuation,
    final_valuation_low: base_valuation * 0.9,
    final_valuation_high: base_valuation * 1.1,
    confidence_score: calculateConfidenceScore(comps.length, valuation_basis),
    comparable_count: comps.length,
    valuation_basis,
    improvement_opportunities: computeImprovementOpportunities(store),
  };
}
