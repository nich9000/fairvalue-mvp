import { supabase } from '../db/supabase';
import { Comp, StoreInput, ValuationResult } from '../types';
import { computeImprovementOpportunities } from './metrics';

const DEFAULT_BASE_MULTIPLE = 2.5;
const MIN_MULTIPLE = 1.5;
const MAX_MULTIPLE = 6.0;
const MIN_COMPS_FOR_MEDIAN = 5;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

async function findComparables(platform: string, annualRevenue: number): Promise<Comp[]> {
  const revenueLow = annualRevenue * 0.8;
  const revenueHigh = annualRevenue * 1.2;

  const { data, error } = await supabase
    .from('comps')
    .select('*')
    .eq('platform', platform)
    .gte('annual_revenue', revenueLow)
    .lte('annual_revenue', revenueHigh)
    .order('data_quality_score', { ascending: false })
    .limit(50);

  if (error) throw new Error(`Failed to query comps: ${error.message}`);
  return data ?? [];
}

function calculateBaseMultiple(comps: Comp[]): number {
  if (comps.length < MIN_COMPS_FOR_MEDIAN) return DEFAULT_BASE_MULTIPLE;
  return median(comps.map((c) => Number(c.multiple_achieved)));
}

function calculateConfidenceScore(numComps: number): number {
  if (numComps >= 20) return 92;
  if (numComps >= 10) return 85;
  if (numComps >= 5) return 78;
  return 65;
}

function clampMultiple(multiple: number): number {
  return Math.min(MAX_MULTIPLE, Math.max(MIN_MULTIPLE, multiple));
}

export async function calculateValuation(store: StoreInput): Promise<ValuationResult> {
  const comps = await findComparables(store.platform, store.annual_revenue);
  const baseMultiple = calculateBaseMultiple(comps);

  const adjustmentRetention = (store.customer_retention_pct - 60) * 0.05;
  const adjustmentGrowth = (store.growth_rate_yoy_pct - 10) * 0.03;
  const adjustmentMargin = (store.gross_margin_pct - 40) * 0.02;
  const adjustmentRecurring = store.recurring_revenue_pct * 0.02;

  const rawAdjustedMultiple =
    baseMultiple * (1 + adjustmentRetention + adjustmentGrowth + adjustmentMargin + adjustmentRecurring);
  const adjustedMultiple = clampMultiple(rawAdjustedMultiple);

  const baseValuation = store.annual_revenue * adjustedMultiple;
  const finalValuationLow = baseValuation * 0.9;
  const finalValuationHigh = baseValuation * 1.1;

  const confidenceScore = calculateConfidenceScore(comps.length);
  const improvementOpportunities = computeImprovementOpportunities(store);

  return {
    base_multiple: baseMultiple,
    adjusted_multiple: adjustedMultiple,
    base_valuation: baseValuation,
    final_valuation_low: finalValuationLow,
    final_valuation_high: finalValuationHigh,
    confidence_score: confidenceScore,
    comparable_count: comps.length,
    improvement_opportunities: improvementOpportunities,
  };
}
