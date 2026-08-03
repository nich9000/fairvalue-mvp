import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getListingDetail, ListingDetail, saveDeal } from '../lib/dealsApi';
import { formatCurrency, formatMultiple } from '../lib/format';
import Auth from '../components/Auth';
import Toast from '../components/Toast';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 border-t border-gray-200 pt-6">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500">{title}</h2>
      {children}
    </section>
  );
}

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
      setShowToast(true);
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

  const segment = listing.comparable_segment;
  const vsMarketPct = segment ? ((listing.multiple_achieved - segment.median_multiple) / segment.median_multiple) * 100 : null;
  const marketImpliedPrice = segment ? listing.annual_revenue * segment.median_multiple : null;
  const savings = marketImpliedPrice !== null ? marketImpliedPrice - listing.listing_price : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/deals" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Back to search
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-black">
        {listing.niche_category ?? 'E-commerce business'} <span className="text-gray-400">·</span> {listing.platform}
      </h1>

      <Section title="THE DEAL">
        <p className="text-3xl font-bold text-black">{formatCurrency(listing.listing_price)}</p>
        <p className="text-sm text-gray-500">Asking price</p>

        <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-gray-600">Annual revenue</dt>
          <dd className="text-right font-semibold text-black">{formatCurrency(listing.annual_revenue)}</dd>
          <dt className="text-gray-600">Multiple</dt>
          <dd className="text-right font-semibold text-black">{formatMultiple(listing.multiple_achieved)}</dd>
          {segment && (
            <>
              <dt className="text-gray-600">Market average ({listing.platform} + {listing.fulfillment_model})</dt>
              <dd className="text-right font-semibold text-black">{formatMultiple(segment.median_multiple)}</dd>
            </>
          )}
          {listing.annual_profit !== null && (
            <>
              <dt className="text-gray-600">Annual profit</dt>
              <dd className="text-right font-semibold text-black">
                {formatCurrency(listing.annual_profit)}
                {listing.profit_margin_pct !== null ? ` (${listing.profit_margin_pct.toFixed(0)}%)` : ''}
              </dd>
            </>
          )}
        </dl>

        {savings !== null && vsMarketPct !== null && (
          <p className={`mt-3 text-sm font-semibold ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {savings >= 0 ? `✓ SAVINGS: ${formatCurrency(savings)}` : `ABOVE MARKET: ${formatCurrency(Math.abs(savings))}`} (
            {vsMarketPct >= 0 ? '+' : ''}
            {vsMarketPct.toFixed(0)}% vs. market multiple)
          </p>
        )}
      </Section>

      <Section title="FUNDAMENTALS">
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-gray-600">Fulfillment</dt>
          <dd className="text-right text-black">{listing.fulfillment_model ?? '—'}</dd>
          <dt className="text-gray-600">Traffic channel</dt>
          <dd className="text-right text-black">{listing.traffic_channel ?? '—'}</dd>
          <dt className="text-gray-600">Data quality score</dt>
          <dd className="text-right text-black">{listing.data_completeness_score ?? '—'}/100</dd>
          <dt className="text-gray-600">Status</dt>
          <dd className="text-right capitalize text-black">{listing.listing_status}</dd>
        </dl>
      </Section>

      {segment && (
        <Section title="COMPARABLE DEALS">
          <p className="text-sm text-gray-700">
            Based on {segment.sample_size} similar {listing.platform} + {listing.fulfillment_model} + {listing.traffic_channel} businesses:
          </p>
          <p className="mt-1 text-sm text-gray-700">
            Median multiple <strong className="text-black">{formatMultiple(segment.median_multiple)}</strong>, range{' '}
            {formatMultiple(segment.min_multiple ?? 0)}–{formatMultiple(segment.max_multiple ?? 0)}
          </p>
          {vsMarketPct !== null && (
            <p className={`mt-1 text-sm font-semibold ${vsMarketPct <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              This deal: {formatMultiple(listing.multiple_achieved)} = {vsMarketPct <= 0 ? '' : '+'}
              {vsMarketPct.toFixed(0)}% {vsMarketPct <= 0 ? 'below market ✓' : 'above market'}
            </p>
          )}
        </Section>
      )}

      {listing.risk_factors.length > 0 && (
        <Section title="RISK FACTORS">
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
            {listing.risk_factors.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Section>
      )}

      {listing.improvement_potential.length > 0 && (
        <Section title="UPSIDE POTENTIAL">
          {listing.improvement_potential.map((op) => (
            <p key={op.scenario} className="text-sm text-gray-700">
              {op.scenario}: business could be worth ~<span className="font-semibold text-black">{formatCurrency(op.potential_value)}</span>
            </p>
          ))}
        </Section>
      )}

      <Section title="LISTING SOURCE">
        <p className="text-sm capitalize text-gray-700">{listing.source_marketplace.replace('_', ' ')}</p>
        {listing.listed_date && <p className="text-xs text-gray-500">Listed {listing.listed_date}</p>}
        {listing.description && <p className="mt-2 text-sm text-gray-700">{listing.description}</p>}
      </Section>

      <button
        type="button"
        onClick={handleSave}
        disabled={saved}
        className="mt-8 w-full border border-brand py-3 text-sm font-semibold text-brand hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400"
      >
        {saved ? 'Saved to your account' : 'Save for later'}
      </button>
      {saveError && <p className="mt-2 text-sm text-red-600">{saveError}</p>}

      {showAuth && <Auth onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} />}
      {showToast && <Toast message="Deal saved" onDismiss={() => setShowToast(false)} />}
    </div>
  );
}
