import { api } from './api';

export interface MarketplaceListing {
  id: string;
  external_id: string | null;
  source_marketplace: string;
  source_url: string | null;
  listing_price: number;
  annual_revenue: number;
  annual_profit: number | null;
  multiple_achieved: number;
  profit_margin_pct: number | null;
  growth_rate_yoy_pct: number | null;
  platform: string;
  niche_category: string | null;
  fulfillment_model: string | null;
  traffic_channel: string | null;
  data_completeness_score: number | null;
  listed_date: string | null;
  sold_date: string | null;
  listing_status: string;
  description: string | null;
  composite_score: number | null;
}

export interface PricingSegment {
  platform: string;
  fulfillment_model: string | null;
  traffic_channel: string | null;
  median_multiple: number;
  mean_multiple: number | null;
  std_dev_multiple: number | null;
  min_multiple: number | null;
  max_multiple: number | null;
  sample_size: number | null;
}

export interface ListingDetail extends MarketplaceListing {
  deal_score: number | null;
  comparable_segment: PricingSegment | null;
  risk_factors: string[];
  improvement_potential: { scenario: string; potential_value: number }[];
  saved_by_user: boolean;
}

export interface SearchFilters {
  platform?: string;
  niche?: string;
  revenue_min?: number;
  revenue_max?: number;
  fulfillment?: string;
  traffic?: string;
  sort?: 'deal_score' | 'revenue' | 'listed_date';
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  listings: MarketplaceListing[];
  total_count: number;
  page: number;
  has_next: boolean;
}

export interface SavedDeal {
  id: string;
  listing_id: string;
  saved_at: string;
  notes: string | null;
  interest_level: string;
  marketplace_listings: MarketplaceListing;
}

export async function searchListings(filters: SearchFilters) {
  const { data } = await api.get<SearchResponse>('/api/listings', { params: filters });
  return data;
}

export async function getListingDetail(id: string) {
  const { data } = await api.get<ListingDetail>(`/api/listings/${id}`);
  return data;
}

export async function getSavedDeals(status?: 'all' | 'active' | 'sold') {
  const { data } = await api.get<{ saved_deals: SavedDeal[] }>('/api/users/saved-deals', {
    params: status && status !== 'all' ? { status } : undefined,
  });
  return data.saved_deals;
}

export async function saveDeal(listing_id: string, notes?: string) {
  const { data } = await api.post('/api/users/saved-deals', { listing_id, notes });
  return data;
}

export async function unsaveDeal(listing_id: string) {
  const { data } = await api.delete(`/api/users/saved-deals/${listing_id}`);
  return data;
}
