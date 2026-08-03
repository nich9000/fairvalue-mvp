import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Auth from '../components/Auth';
import Toast from '../components/Toast';
import { SavedDeal, getSavedDeals, unsaveDeal } from '../lib/dealsApi';
import { formatCurrency, formatMultiple } from '../lib/format';

const SOURCE_LABEL: Record<string, string> = {
  empire_flippers: 'Empire Flippers',
  flippa: 'Flippa',
  proprietor: 'Proprietor',
};

export default function SavedDeals() {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('fairvalue_user_id'));
  const [deals, setDeals] = useState<SavedDeal[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'sold'>('all');
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!userId) return;
    getSavedDeals(filter)
      .then(setDeals)
      .catch(() => setError('Could not load your saved deals.'));
  }, [userId, filter]);

  async function handleRemove(listingId: string) {
    await unsaveDeal(listingId);
    setDeals((prev) => prev.filter((d) => d.listing_id !== listingId));
    setShowToast(true);
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
  const belowMarketCount = deals.filter(
    (d) => d.marketplace_listings.segment_median_multiple !== null && d.marketplace_listings.multiple_achieved < d.marketplace_listings.segment_median_multiple
  ).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Your deals</h1>
          <p className="mt-1 text-sm text-gray-600">
            {deals.length} deals saved | {formatCurrency(totalValue)} total value
          </p>
        </div>
        <Link to="/deals" className="text-sm font-semibold text-brand hover:text-brand-dark">
          ← Search more deals
        </Link>
      </div>

      <div className="mt-6 flex gap-2">
        {(['all', 'active', 'sold'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`border px-3 py-1 text-xs font-medium capitalize ${
              filter === f ? 'border-brand bg-brand text-white' : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {deals.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500">PORTFOLIO SNAPSHOT</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-600">Total asking price</dt>
            <dd className="text-right font-semibold text-black">{formatCurrency(totalValue)}</dd>
            <dt className="text-gray-600">Average multiple</dt>
            <dd className="text-right font-semibold text-black">{formatMultiple(avgMultiple)}</dd>
            {belowMarketCount > 0 && (
              <>
                <dt className="text-gray-600">Below market</dt>
                <dd className="text-right font-semibold text-green-600">
                  ✓ {belowMarketCount} of {deals.length} deals
                </dd>
              </>
            )}
            {bestDeal && (
              <>
                <dt className="text-gray-600">Best deal saved</dt>
                <dd className="text-right font-semibold text-black">
                  {bestDeal.marketplace_listings.niche_category} ({formatMultiple(bestDeal.marketplace_listings.multiple_achieved)})
                </dd>
              </>
            )}
          </dl>
        </div>
      )}

      <div className="mt-6 space-y-0 border-t border-gray-200">
        {deals.map((deal) => (
          <div key={deal.id} className="flex items-start justify-between border-b border-gray-200 py-4">
            <div>
              <p className="font-semibold text-black">
                {deal.marketplace_listings.niche_category ?? 'E-commerce business'} · {deal.marketplace_listings.platform}
              </p>
              <p className="text-sm text-gray-700">
                {formatCurrency(deal.marketplace_listings.listing_price)} · {formatMultiple(deal.marketplace_listings.multiple_achieved)} ·{' '}
                <span className="capitalize">{deal.marketplace_listings.listing_status}</span> · listed on{' '}
                {SOURCE_LABEL[deal.marketplace_listings.source_marketplace] ?? deal.marketplace_listings.source_marketplace}
              </p>
              {deal.notes && <p className="mt-1 text-xs text-gray-500">Note: {deal.notes}</p>}
            </div>
            <div className="flex shrink-0 gap-4 text-sm">
              <Link to={`/deals/${deal.listing_id}`} className="font-semibold text-brand hover:text-brand-dark">
                View
              </Link>
              <button type="button" onClick={() => handleRemove(deal.listing_id)} className="font-semibold text-gray-400 hover:text-red-600">
                Remove
              </button>
            </div>
          </div>
        ))}
        {deals.length === 0 && !error && <p className="py-4 text-gray-500">No saved deals yet.</p>}
      </div>

      {showToast && <Toast message="Deal removed" onDismiss={() => setShowToast(false)} />}
    </div>
  );
}
