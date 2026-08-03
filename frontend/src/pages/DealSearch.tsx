import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DealCard from '../components/DealCard';
import { MarketplaceListing, SearchFilters, searchListings } from '../lib/dealsApi';

const PLATFORMS = ['Shopify', 'Amazon FBA', 'Amazon FBA / Shopify', 'Amazon FBM', 'WooCommerce', 'BigCommerce'];
const FULFILLMENT = ['merchant_fulfilled', 'FBA', 'dropshipping', 'digital_product', 'subscription_box', 'direct_sales'];
const TRAFFIC = ['organic', 'paid_ads', 'email_marketing', 'direct_sales'];

export default function DealSearch() {
  const [filters, setFilters] = useState<SearchFilters>({ sort: 'deal_score', page: 1, limit: 20 });
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function runSearch(nextFilters: SearchFilters, append: boolean) {
    setLoading(true);
    setError(null);
    searchListings(nextFilters)
      .then((res) => {
        setListings((prev) => (append ? [...prev, ...res.listings] : res.listings));
        setTotalCount(res.total_count);
        setHasNext(res.has_next);
      })
      .catch(() => setError('Could not load deals. Please try again.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    runSearch({ sort: 'deal_score', page: 1, limit: 20 }, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch() {
    const next = { ...filters, page: 1 };
    setFilters(next);
    runSearch(next, false);
  }

  function loadMore() {
    const next = { ...filters, page: (filters.page ?? 1) + 1 };
    setFilters(next);
    runSearch(next, true);
  }

  function update<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Find your next deal</h1>
        <Link to="/saved" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
          Saved deals →
        </Link>
      </div>
      <p className="mt-1 text-sm text-gray-500">E-commerce businesses for sale, ranked by deal quality.</p>

      <div className="mt-6 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-600">Platform</span>
          <select className="input" value={filters.platform ?? ''} onChange={(e) => update('platform', e.target.value)}>
            <option value="">Any</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-600">Niche</span>
          <input
            className="input"
            placeholder="e.g. pet care"
            value={filters.niche ?? ''}
            onChange={(e) => update('niche', e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-600">Fulfillment</span>
          <select className="input" value={filters.fulfillment ?? ''} onChange={(e) => update('fulfillment', e.target.value)}>
            <option value="">Any</option>
            {FULFILLMENT.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-600">Traffic channel</span>
          <select className="input" value={filters.traffic ?? ''} onChange={(e) => update('traffic', e.target.value)}>
            <option value="">Any</option>
            {TRAFFIC.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-600">Min revenue ($)</span>
          <input
            type="number"
            className="input"
            value={filters.revenue_min ?? ''}
            onChange={(e) => update('revenue_min', e.target.value ? Number(e.target.value) : undefined)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-600">Max revenue ($)</span>
          <input
            type="number"
            className="input"
            value={filters.revenue_max ?? ''}
            onChange={(e) => update('revenue_max', e.target.value ? Number(e.target.value) : undefined)}
          />
        </label>
        <div className="sm:col-span-2 lg:col-span-3">
          <button
            type="button"
            onClick={handleSearch}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 sm:w-auto sm:px-8"
          >
            Search
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">{totalCount} deals found</p>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          Sort by
          <select
            className="input w-auto"
            value={filters.sort}
            onChange={(e) => {
              const next = { ...filters, sort: e.target.value as SearchFilters['sort'], page: 1 };
              setFilters(next);
              runSearch(next, false);
            }}
          >
            <option value="deal_score">Best deal</option>
            <option value="revenue">Revenue</option>
            <option value="listed_date">Newest</option>
          </select>
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {listings.map((listing) => (
          <DealCard key={listing.id} listing={listing} />
        ))}
      </div>

      {listings.length === 0 && !loading && !error && <p className="mt-8 text-center text-gray-500">No deals match these filters.</p>}

      {hasNext && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Load more deals'}
          </button>
        </div>
      )}
    </div>
  );
}
