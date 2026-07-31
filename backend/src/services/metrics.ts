import { ImprovementOpportunity, StoreInput } from '../types';

const DIFFICULTY_WEIGHT: Record<ImprovementOpportunity['difficulty'], number> = {
  easy: 1,
  medium: 1.5,
  hard: 2,
};

export function computeImprovementOpportunities(store: StoreInput): ImprovementOpportunity[] {
  const candidates: ImprovementOpportunity[] = [];

  if (store.gross_margin_pct < 55) {
    candidates.push({
      metric: 'gross_margin',
      current: store.gross_margin_pct,
      potential_target: 55,
      value_gain: (55 - store.gross_margin_pct) * store.annual_revenue * 0.02,
      difficulty: 'medium',
      timeline_weeks: 12,
    });
  }

  if (store.customer_retention_pct < 80) {
    candidates.push({
      metric: 'customer_retention',
      current: store.customer_retention_pct,
      potential_target: 80,
      value_gain: (80 - store.customer_retention_pct) * store.annual_revenue * 0.01,
      difficulty: 'hard',
      timeline_weeks: 16,
    });
  }

  if (store.recurring_revenue_pct < 40) {
    candidates.push({
      metric: 'recurring_revenue',
      current: store.recurring_revenue_pct,
      potential_target: 40,
      value_gain: (40 - store.recurring_revenue_pct) * store.annual_revenue * 0.015,
      difficulty: 'medium',
      timeline_weeks: 20,
    });
  }

  if (store.growth_rate_yoy_pct < 25) {
    candidates.push({
      metric: 'growth_rate',
      current: store.growth_rate_yoy_pct,
      potential_target: 25,
      value_gain: (25 - store.growth_rate_yoy_pct) * store.annual_revenue * 0.01,
      difficulty: 'hard',
      timeline_weeks: 24,
    });
  }

  if (store.customer_concentration_pct > 20) {
    candidates.push({
      metric: 'customer_concentration',
      current: store.customer_concentration_pct,
      potential_target: 20,
      value_gain: (store.customer_concentration_pct - 20) * store.annual_revenue * 0.01,
      difficulty: 'medium',
      timeline_weeks: 10,
    });
  }

  if (store.niche_specialization_level < 4) {
    candidates.push({
      metric: 'niche_specialization',
      current: store.niche_specialization_level,
      potential_target: 4,
      value_gain: (4 - store.niche_specialization_level) * store.annual_revenue * 0.015,
      difficulty: 'easy',
      timeline_weeks: 8,
    });
  }

  return candidates
    .filter((c) => c.value_gain > 0)
    .sort((a, b) => b.value_gain / DIFFICULTY_WEIGHT[b.difficulty] - a.value_gain / DIFFICULTY_WEIGHT[a.difficulty])
    .slice(0, 6);
}
