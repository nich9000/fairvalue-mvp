import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { claimStore, getStore } from '../lib/api';
import MetricCard from '../components/MetricCard';
import Auth from '../components/Auth';

interface StoreData {
  store: { id: string; store_name: string };
  valuation: {
    final_valuation_low: number;
    final_valuation_high: number;
    confidence_score: number;
    comparable_count: number;
    improvement_opportunities: any[];
  } | null;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function Results() {
  const { storeId } = useParams<{ storeId: string }>();
  const [data, setData] = useState<StoreData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    getStore(storeId)
      .then(setData)
      .catch(() => setError('Could not load this valuation.'));
  }, [storeId]);

  async function claimAndMarkSaved() {
    try {
      await claimStore(storeId!);
      setSaved(true);
      setSaveError(null);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        // Cached session no longer valid (e.g. account was removed) — clear it and ask to log in again.
        localStorage.removeItem('fairvalue_token');
        localStorage.removeItem('fairvalue_user_id');
        setShowAuth(true);
      } else {
        setSaveError(err?.response?.data?.error ?? 'Could not save this valuation. Please try again.');
      }
    }
  }

  async function handleSave() {
    setSaveError(null);
    const token = localStorage.getItem('fairvalue_token');
    if (!token) {
      setShowAuth(true);
      return;
    }
    await claimAndMarkSaved();
  }

  async function handleAuthSuccess() {
    setShowAuth(false);
    await claimAndMarkSaved();
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-gray-500">Calculating your valuation…</div>;
  }

  const { store, valuation } = data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-sm font-medium text-emerald-600">{store.store_name}</p>
      {valuation ? (
        <>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Your store is worth{' '}
            <span className="text-emerald-600">
              {formatCurrency(valuation.final_valuation_low)} – {formatCurrency(valuation.final_valuation_high)}
            </span>
          </h1>
          <span className="mt-4 inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
            {valuation.confidence_score}% confidence based on {valuation.comparable_count} similar stores
          </span>

          <h2 className="mt-10 text-lg font-bold text-gray-900">Improvement roadmap</h2>
          <p className="text-sm text-gray-500">Ranked by value gain vs. effort.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {valuation.improvement_opportunities.map((op) => (
              <MetricCard key={op.metric} opportunity={op} />
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled
              title="Coming soon"
              className="flex-1 rounded-lg bg-gray-900 py-3 text-sm font-semibold text-white opacity-60"
            >
              Unlock full coaching ($49/month) — coming soon
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saved}
              className="flex-1 rounded-lg border border-emerald-600 py-3 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
            >
              {saved ? 'Saved to your account' : 'Save this valuation'}
            </button>
          </div>
          {saveError && <p className="mt-2 text-sm text-red-600">{saveError}</p>}
        </>
      ) : (
        <p className="mt-4 text-gray-500">No valuation available yet.</p>
      )}

      {showAuth && <Auth onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} />}
    </div>
  );
}
