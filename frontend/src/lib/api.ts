import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fairvalue_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export interface ImprovementOpportunity {
  metric: string;
  current: number;
  potential_target: number;
  value_gain: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeline_weeks: number;
}

export interface ValuationResult {
  valuation_id: string;
  base_multiple: number;
  adjusted_multiple: number;
  base_valuation: number;
  final_valuation_low: number;
  final_valuation_high: number;
  confidence_score: number;
  comparable_count: number;
  improvement_opportunities: ImprovementOpportunity[];
}

export async function createStoreValuation(input: StoreInput) {
  const { data } = await api.post<{ store_id: string; valuation: ValuationResult }>('/api/stores', input);
  return data;
}

export async function getStore(storeId: string) {
  const { data } = await api.get(`/api/stores/${storeId}`);
  return data;
}

export async function claimStore(storeId: string) {
  const { data } = await api.patch(`/api/stores/${storeId}/claim`);
  return data;
}

export async function signup(email: string, password: string) {
  const { data } = await api.post<{ user_id: string; token: string }>('/api/auth/signup', { email, password });
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await api.post<{ user_id: string; token: string }>('/api/auth/login', { email, password });
  return data;
}
