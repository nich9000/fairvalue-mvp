import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getListingDetail, ListingDetail, saveDeal } from '../lib/dealsApi';
import { formatCurrency, formatMultiple } from '../lib/format';
import Auth from '../components/Auth';

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    getListingDetail(id)
      .then((data) => {
        setListing(data);
        setSaved(data.saved_by_user);
      })
      .catch(() => setError('Could not load this deal.'));
  }, [id]);

  async function doSave() {
    try {
      await saveDeal(id!);
      setSaved(true);
      setSaveError(null);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('fairvalue_token');
        localStorage.removeItem('fairvalue_user_id');
        setShowAuth(true);
      } else {
        setSaveError('Could not save this deal. Please try again.');
      }
    }
  }

  async function handleSave() {
    setSaveError(null);
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

  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!listing) return <div className="p-8 text-center text-gray-500">Loading deal…</div>;

  const vsMarket = listing.comparable_segment
    ? ((listing.multiple_achieved - listing.comparable_segment.median_multiple) / listing.comparable_segment.median_multiple) * 100
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/deals" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
        ← Back to search
      </Link>

      <h1 className="mt-2 text-2xl font-bold text-gray-900">
        {listing.niche_category ?? 'E-commerce business'} <span className="text-gray-400">·</span> {listing.platform}
      </h1>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-500">THE DEAL</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-gray-500">Asking price</dt>
          <dd className="text-right font-semibold text-gray-900">{formatCurrency(listing.listing_price)}</dd>
          <dt className="text-gray-500">Annual revenue</dt>
          <dd className="text-right font-semibold text-gray-900">{formatCurrency(listing.annual_revenue)}</dd>
          <dt className="text-gray-500">Multiple</dt>
          <dd className="text-right font-semibold text-gray-900">{formatMultiple(listing.multiple_achieved)}</dd>
          {vsMarket !== null && (
            <>
              <dt className="text-gray-500">vs. segment median ({formatMultiple(listing.comparable_segment!.median_multiple)})</dt>
              <dd className={`text-right font-semibold ${vsMarket <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {vsMarket <= 0 ? '' : '+'}
                {vsMarket.toFixed(0)}% {vsMarket <= 0 ? '(good value)' : ''}
              </dd>
            </>
          )}
          {listing.annual_profit !== null && (
            <>
              <dt className="text-gray-500">Annual profit</dt>
              <dd className="text-right font-semibold text-gray-900">
                {formatCurrency(listing.annual_profit)}
                {listing.profit_margin_pct !== null ? ` (${listing.profit_margin_pct.toFixed(0)}%)` : ''}
              </dd>
            </>
          )}
        </dl>
      </section>

      <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-500">FUNDAMENTALS</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-gray-500">Fulfillment</dt>
          <dd className="text-right text-gray-900">{listing.fulfillment_model ?? '—'}</dd>
          <dt className="text-gray-500">Traffic channel</dt>
          <dd className="text-right text-gray-900">{listing.traffic_channel ?? '—'}</dd>
          <dt className="text-gray-500">Data quality score</dt>
          <dd className="text-right text-gray-900">{listing.data_completeness_score ?? '—'}/100</dd>
          <dt className="text-gray-500">Status</dt>
          <dd className="text-right capitalize text-gray-900">{listing.listing_status}</dd>
        </dl>
      </section>

      {listing.comparable_segment && (
        <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-500">COMPARABLE ANALYSIS</h2>
          <p className="text-sm text-gray-700">
            Similar {listing.platform} + {listing.fulfillment_model} + {listing.traffic_channel} businesses ({listing.comparable_segment.sample_size} comps):
          </p>
          <p className="mt-1 text-sm text-gray-700">
            Median multiple <strong>{formatMultiple(listing.comparable_segment.median_multiple)}</strong>, range{' '}
            {formatMultiple(listing.comparable_segment.min_multiple ?? 0)}–{formatMultiple(listing.comparable_segment.max_multiple ?? 0)}.
          </p>
        </section>
      )}

      {listing.risk_factors.length > 0 && (
        <section className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-amber-800">⚠ RISK FACTORS</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-amber-900">
            {listing.risk_factors.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      {listing.improvement_potential.length > 0 && (
        <section className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-emerald-800">🚀 IMPROVEMENT POTENTIAL</h2>
          {listing.improvement_potential.map((op) => (
            <p key={op.scenario} className="text-sm text-emerald-900">
              {op.scenario}: business could be worth ~{formatCurrency(op.potential_value)}
            </p>
          ))}
        </section>
      )}

      <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-500">LISTING SOURCE</h2>
        <p className="text-sm capitalize text-gray-700">{listing.source_marketplace.replace('_', ' ')}</p>
        {listing.listed_date && <p className="text-xs text-gray-500">Listed {listing.listed_date}</p>}
        {listing.description && <p className="mt-2 text-sm text-gray-600">{listing.description}</p>}
      </section>

      <button
        type="button"
        onClick={handleSave}
        disabled={saved}
        className="mt-6 w-full rounded-lg border border-emerald-600 py-3 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
      >
        {saved ? 'Saved to your account' : 'Save for later'}
      </button>
      {saveError && <p className="mt-2 text-sm text-red-600">{saveError}</p>}

      {showAuth && <Auth onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} />}
    </div>
  );
}
