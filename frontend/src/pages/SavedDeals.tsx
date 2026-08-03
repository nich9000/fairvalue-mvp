import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Auth from '../components/Auth';
import { SavedDeal, getSavedDeals, unsaveDeal } from '../lib/dealsApi';
import { formatCurrency, formatMultiple } from '../lib/format';

export default function SavedDeals() {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('fairvalue_user_id'));
  const [deals, setDeals] = useState<SavedDeal[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'sold'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    getSavedDeals(filter)
      .then(setDeals)
      .catch(() => setError('Could not load your saved deals.'));
  }, [userId, filter]);

  async function handleRemove(listingId: string) {
    await unsaveDeal(listingId);
    setDeals((prev) => prev.filter((d) => d.listing_id !== listingId));
  }

  if (!userId) {
    return <Auth onSuccess={setUserId} />;
  }

  const totalValue = deals.reduce((sum, d) => sum + d.marketplace_listings.listing_price, 0);
  const avgMultiple = deals.length
    ? deals.reduce((sum, d) => sum + d.marketplace_listings.multiple_achieved, 0) / deals.length
    : 0;
  const bestDeal = deals.length
    ? deals.reduce((best, d) => (d.marketplace_listings.multiple_achieved < best.marketplace_listings.multiple_achieved ? d : best))
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Saved deals</h1>
        <Link to="/deals" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
          ← Search more deals
        </Link>
      </div>

      <div className="mt-4 flex gap-2">
        {(['all', 'active', 'sold'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              filter === f ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-4 space-y-3">
        {deals.map((deal) => (
          <div key={deal.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  {deal.marketplace_listings.niche_category ?? 'E-commerce business'} · {deal.marketplace_listings.platform}
                </p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(deal.marketplace_listings.listing_price)} ·{' '}
                  {formatMultiple(deal.marketplace_listings.multiple_achieved)} ·{' '}
                  <span className="capitalize">{deal.marketplace_listings.listing_status}</span>
                </p>
                {deal.notes && <p className="mt-1 text-xs text-gray-500">Note: {deal.notes}</p>}
              </div>
              <div className="flex shrink-0 gap-3 text-sm">
                <Link to={`/deals/${deal.listing_id}`} className="font-medium text-emerald-600 hover:text-emerald-700">
                  View
                </Link>
                <button type="button" onClick={() => handleRemove(deal.listing_id)} className="font-medium text-gray-400 hover:text-red-600">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
        {deals.length === 0 && !error && <p className="text-gray-500">No saved deals yet.</p>}
      </div>

      {deals.length > 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-500">PORTFOLIO SNAPSHOT</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-500">Total saved value</dt>
            <dd className="text-right font-semibold text-gray-900">{formatCurrency(totalValue)}</dd>
            <dt className="text-gray-500">Avg multiple</dt>
            <dd className="text-right font-semibold text-gray-900">{formatMultiple(avgMultiple)}</dd>
            {bestDeal && (
              <>
                <dt className="text-gray-500">Best deal</dt>
                <dd className="text-right font-semibold text-gray-900">
                  {bestDeal.marketplace_listings.niche_category} ({formatMultiple(bestDeal.marketplace_listings.multiple_achieved)})
                </dd>
              </>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
