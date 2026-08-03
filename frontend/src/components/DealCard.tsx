import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketplaceListing, saveDeal } from '../lib/dealsApi';
import { formatCurrency, formatMultiple } from '../lib/format';
import Auth from './Auth';
import Toast from './Toast';

const SOURCE_LABEL: Record<string, string> = {
  empire_flippers: 'Empire Flippers',
  flippa: 'Flippa',
  proprietor: 'Proprietor',
};

function stripeColor(valueScore: number | null): string {
  if (valueScore === null) return 'border-l-gray-300';
  if (valueScore > 10) return 'border-l-green-600';
  if (valueScore < -10) return 'border-l-red-600';
  return 'border-l-gray-300';
}

function vsMarketLabel(listing: MarketplaceListing): string | null {
  if (listing.segment_median_multiple === null) return null;
  const diffPct = ((listing.multiple_achieved - listing.segment_median_multiple) / listing.segment_median_multiple) * 100;
  const sign = diffPct <= 0 ? '' : '+';
  const suffix = diffPct <= 0 ? ' ✓' : '';
  return `(vs ${formatMultiple(listing.segment_median_multiple)} avg${diffPct !== 0 ? `, ${sign}${diffPct.toFixed(0)}%` : ''})${suffix}`;
}

export default function DealCard({ listing }: { listing: MarketplaceListing }) {
  const [saved, setSaved] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showToast, setShowToast] = useState(false);

  async function doSave() {
    await saveDeal(listing.id);
    setSaved(true);
    setShowToast(true);
  }

  async function handleSave() {
    if (!localStorage.getItem('fairvalue_token')) {
      setShowAuth(true);
      return;
    }
    await doSave();
  }

  async function handleAuthSuccess() {
    setShowAuth(false);
    await doSave();
  }

  return (
    <div className={`border border-gray-200 border-l-4 bg-white p-5 ${stripeColor(listing.value_score)}`}>
      <h3 className="font-semibold text-black">{listing.niche_category ?? 'E-commerce business'}</h3>
      <p className="mt-0.5 text-sm text-gray-500">
        {listing.platform} | {listing.fulfillment_model ?? 'n/a'} | {listing.traffic_channel ?? 'n/a'}
      </p>

      <p className="mt-3 text-2xl font-bold text-black">{formatCurrency(listing.listing_price)}</p>
      <p className="text-sm text-gray-700">Annual revenue: {formatCurrency(listing.annual_revenue)}</p>
      <p className="text-sm text-gray-700">
        Multiple: {formatMultiple(listing.multiple_achieved)} {vsMarketLabel(listing) && <span>{vsMarketLabel(listing)}</span>}
      </p>

      {listing.profit_margin_pct !== null && <p className="mt-2 text-sm text-gray-700">Profit margin: {listing.profit_margin_pct.toFixed(0)}%</p>}
      <p className="text-xs text-gray-500">
        {listing.listed_date ? `Listed ${listing.listed_date}` : 'Listing date unavailable'} on{' '}
        {SOURCE_LABEL[listing.source_marketplace] ?? listing.source_marketplace}
      </p>

      <div className="mt-4 flex gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saved}
          className="text-sm font-semibold text-brand hover:text-brand-dark disabled:text-gray-400"
        >
          {saved ? 'Saved' : 'Save'}
        </button>
        <Link to={`/deals/${listing.id}`} className="text-sm font-semibold text-brand hover:text-brand-dark">
          See analysis →
        </Link>
      </div>

      {showAuth && <Auth onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} />}
      {showToast && <Toast message="Deal saved" onDismiss={() => setShowToast(false)} />}
    </div>
  );
}
