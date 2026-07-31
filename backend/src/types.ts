export type Platform = 'Shopify' | 'Etsy' | 'Amazon FBA' | 'WooCommerce' | 'Other';

export interface StoreInput {
  store_name: string;
  platform: Platform;
  annual_revenue: number;
  annual_profit: number;
  store_age_months: number;
  customer_retention_pct: number;
  customer_concentration_pct: number;
  growth_rate_yoy_pct: number;
  gross_margin_pct: number;
  recurring_revenue_pct: number;
  niche_specialization_level: number;
}

export interface Store extends StoreInput {
  id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comp {
  id: string;
  sale_price: number;
  annual_revenue: number;
  annual_profit: number | null;
  multiple_achieved: number;
  platform: string;
  niche_category: string | null;
  customer_retention_pct: number | null;
  growth_rate_yoy_pct: number | null;
  gross_margin_pct: number | null;
  sold_date: string | null;
  source: string | null;
  is_verified: boolean;
  data_quality_score: number | null;
}

export interface ImprovementOpportunity {
  metric: string;
  current: number;
  potential_target: number;
  value_gain: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeline_weeks: number;
}

export interface ValuationResult {
  base_multiple: number;
  adjusted_multiple: number;
  base_valuation: number;
  final_valuation_low: number;
  final_valuation_high: number;
  confidence_score: number;
  comparable_count: number;
  improvement_opportunities: ImprovementOpportunity[];
}

export interface AuthTokenPayload {
  user_id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}
