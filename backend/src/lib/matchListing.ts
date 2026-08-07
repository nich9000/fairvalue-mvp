import { categoryBucket } from './categoryBucket';
import { expandPlatformDisplayNames } from './platformGroups';

export interface ListingFilterCriteria {
  marketplace?: string | null;
  platform?: string | null;
  category?: string | null;
  niche?: string | null;
  revenue_min?: number | null;
  revenue_max?: number | null;
  multiple_min?: number | null;
  multiple_max?: number | null;
}

interface MatchableListing {
  source_marketplace: string;
  platform: string;
  niche_category: string | null;
  annual_revenue: number;
  multiple_achieved: number;
}

// Same filter semantics as GET /api/listings, factored out so tracked-niche matching
// (used to compute "N new listings this week") can't silently drift from search behavior.
// Uses "|" not "," to split — several category bucket names (e.g. "Toys, Games & Hobbies")
// contain a literal comma, which would otherwise collide with the multi-select delimiter.
export function matchesFilters(listing: MatchableListing, filters: ListingFilterCriteria): boolean {
  if (filters.marketplace) {
    const marketplaces = filters.marketplace.split('|').filter(Boolean);
    if (marketplaces.length && !marketplaces.includes(listing.source_marketplace)) return false;
  }
  if (filters.platform) {
    const requested = filters.platform.split('|').filter(Boolean);
    const rawValues = expandPlatformDisplayNames(requested);
    if (rawValues.length && !rawValues.includes(listing.platform)) return false;
  }
  if (filters.category) {
    const categories = filters.category.split('|').filter(Boolean);
    if (categories.length && !categories.includes(categoryBucket(listing.niche_category))) return false;
  }
  if (filters.niche && !(listing.niche_category ?? '').toLowerCase().includes(filters.niche.toLowerCase())) return false;
  if (filters.revenue_min != null && listing.annual_revenue < filters.revenue_min) return false;
  if (filters.revenue_max != null && listing.annual_revenue > filters.revenue_max) return false;
  if (filters.multiple_min != null && listing.multiple_achieved < filters.multiple_min) return false;
  if (filters.multiple_max != null && listing.multiple_achieved > filters.multiple_max) return false;
  return true;
}
