import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DealCard from '../components/DealCard';
import { MarketplaceListing, SearchFilters, SourceBreakdownEntry, searchListings } from '../lib/dealsApi';
import { formatMultiple } from '../lib/format';

const PLATFORMS = ['Shopify', 'Amazon FBA', 'Amazon FBA / Shopify', 'Amazon FBM', 'WooCommerce', 'BigCommerce'];
const FULFILLMENT = ['merchant_fulfilled', 'FBA', 'dropshipping', 'digital_product', 'subscription_box', 'direct_sales'];
const TRAFFIC = ['organic', 'paid_ads', 'email_marketing', 'direct_sales'];

const SOURCE_LABEL: Record<string, string> = {
  empire_flippers: 'Empire Flippers',
  flippa: 'Flippa',
  proprietor: 'Proprietor',
};

const fieldClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm text-black focus:border-brand focus:outline-none';

export default function DealSearch() {
  const [filters, setFilters] = useState<SearchFilters>({ sort: 'deal_score', page: 1, limit: 20 });
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [sourceBreakdown, setSourceBreakdown] = useState<SourceBreakdownEntry[]>([]);
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
        setSourceBreakdown(res.source_breakdown);
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
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-baseline justify-between">
        <h1 className="text-4xl font-bold text-black">Find deals smarter</h1>
        <Link to="/saved" className="text-sm font-semibold text-brand hover:text-brand-dark">
          Saved deals →
        </Link>
      </div>
      <p className="mt-2 text-base text-gray-700">Search real e-commerce businesses from all marketplaces.</p>
      <p className="mt-3 text-sm text-gray-500">
        ✓ Real listings from Empire Flippers, Flippa, and Proprietor · ✓ Updated today
      </p>

      <div className="mt-8 grid gap-4 border border-gray-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-600">Platform</span>
          <select className={fieldClass} value={filters.platform ?? ''} onChange={(e) => update('platform', e.target.value)}>
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
            className={fieldClass}
            placeholder="e.g. pet care"
            value={filters.niche ?? ''}
            onChange={(e) => update('niche', e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-600">Fulfillment</span>
          <select className={fieldClass} value={filters.fulfillment ?? ''} onChange={(e) => update('fulfillment', e.target.value)}>
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
          <select className={fieldClass} value={filters.traffic ?? ''} onChange={(e) => update('traffic', e.target.value)}>
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
            className={fieldClass}
            value={filters.revenue_min ?? ''}
            onChange={(e) => update('revenue_min', e.target.value ? Number(e.target.value) : undefined)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-600">Max revenue ($)</span>
          <input
            type="number"
            className={fieldClass}
            value={filters.revenue_max ?? ''}
            onChange={(e) => update('revenue_max', e.target.value ? Number(e.target.value) : undefined)}
          />
        </label>
        <div className="sm:col-span-2 lg:col-span-3">
          <button
            type="button"
            onClick={handleSearch}
            className="rounded bg-brand px-8 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Search
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-gray-700">{totalCount} deals found</p>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          Sort by
          <select
            className={`${fieldClass} w-auto`}
            value={filters.sort}
            onChange={(e) => {
              const next = { ...filters, sort: e.target.value as SearchFilters['sort'], page: 1 };
              setFilters(next);
              runSearch(next, false);
            }}
          >
            <option value="deal_score">Best value</option>
            <option value="revenue">Revenue</option>
            <option value="listed_date">Newest</option>
          </select>
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
            className="border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400 disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Load more deals'}
          </button>
        </div>
      )}

      {sourceBreakdown.length > 0 && (
        <div className="mt-10 border-t border-gray-200 pt-6">
          <h2 className="text-sm font-semibold text-gray-700">Source marketplace breakdown</h2>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            {sourceBreakdown.map((s) => (
              <li key={s.source_marketplace}>
                {SOURCE_LABEL[s.source_marketplace] ?? s.source_marketplace}: {s.count} deals (avg {formatMultiple(s.avg_multiple)})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
