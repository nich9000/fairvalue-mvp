// Base weights per the deal-ranking spec (value/quality/growth/risk). growth_score is
// null whenever the source data has no growth_rate_yoy_pct (true for the current seed set) —
// the composite renormalizes over whichever components are actually available rather than
// silently treating a missing growth signal as zero.
const BASE_WEIGHTS = { value: 0.4, quality: 0.3, growth: 0.2, riskInv: 0.1 };

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function computeValueScore(segmentMedianMultiple: number, listingMultiple: number): number {
  if (!segmentMedianMultiple) return 50;
  return clamp(((segmentMedianMultiple - listingMultiple) / segmentMedianMultiple) * 100, -100, 100);
}

export function computeRiskScore(profitMarginPct: number | null): number {
  if (profitMarginPct === null || profitMarginPct === undefined) return 50;
  return clamp(100 - (profitMarginPct / 25) * 100, 0, 100);
}

export function computeGrowthScore(growthRateYoyPct: number | null): number | null {
  if (growthRateYoyPct === null || growthRateYoyPct === undefined) return null;
  return clamp(growthRateYoyPct * 2, 0, 100);
}

export function computeCompositeScore(scores: {
  valueScore: number | null;
  qualityScore: number | null;
  growthScore: number | null;
  riskScore: number | null;
}): number {
  const components: { weight: number; value: number }[] = [];
  if (scores.valueScore !== null) components.push({ weight: BASE_WEIGHTS.value, value: scores.valueScore });
  if (scores.qualityScore !== null) components.push({ weight: BASE_WEIGHTS.quality, value: scores.qualityScore });
  if (scores.growthScore !== null) components.push({ weight: BASE_WEIGHTS.growth, value: scores.growthScore });
  if (scores.riskScore !== null) components.push({ weight: BASE_WEIGHTS.riskInv, value: 100 - scores.riskScore });

  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight === 0) return 0;

  return components.reduce((sum, c) => sum + c.value * c.weight, 0) / totalWeight;
}

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function stdDev(values: number[]): number {
  const avg = mean(values);
  const variance = mean(values.map((v) => (v - avg) ** 2));
  return Math.sqrt(variance);
}
