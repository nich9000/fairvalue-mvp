import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStoreValuation, Platform, StoreInput } from '../lib/api';

const PLATFORMS: Platform[] = ['Shopify', 'Etsy', 'Amazon FBA', 'WooCommerce', 'Other'];

type FormState = StoreInput & { email: string };

const INITIAL_STATE: FormState = {
  store_name: '',
  platform: 'Shopify',
  annual_revenue: 0,
  annual_profit: 0,
  store_age_months: 0,
  customer_retention_pct: 60,
  customer_concentration_pct: 20,
  growth_rate_yoy_pct: 10,
  recurring_revenue_pct: 0,
  gross_margin_pct: 40,
  niche_specialization_level: 3,
  email: '',
};

const STEPS = ['Basics', 'Financials', 'Store health', 'Contact'];

export default function Form() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep(): string | null {
    if (step === 0 && !state.store_name.trim()) return 'Store name is required';
    if (step === 1 && state.annual_revenue <= 0) return 'Annual revenue must be greater than 0';
    if (step === 3 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) return 'A valid email is required';
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      localStorage.setItem('fairvalue_lead_email', state.email);
      const { email, ...storeInput } = state;
      const { store_id } = await createStoreValuation(storeInput);
      navigate(`/results/${store_id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Get your free valuation</h1>
      <div className="mt-4 flex gap-1">
        {STEPS.map((label, i) => (
          <div key={label} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-emerald-600' : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className="mt-2 text-sm font-medium text-gray-500">{STEPS[step]}</p>

      <form onSubmit={handleSubmit} className="mt-6 flex-1 space-y-5">
        {step === 0 && (
          <>
            <Field label="Store name">
              <input
                type="text"
                required
                value={state.store_name}
                onChange={(e) => update('store_name', e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Platform">
              <select
                value={state.platform}
                onChange={(e) => update('platform', e.target.value as Platform)}
                className="input"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Annual revenue ($)">
              <input
                type="number"
                required
                min={0}
                value={state.annual_revenue || ''}
                onChange={(e) => update('annual_revenue', Number(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Annual profit ($)">
              <input
                type="number"
                required
                min={0}
                value={state.annual_profit || ''}
                onChange={(e) => update('annual_profit', Number(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Store age (months)">
              <input
                type="number"
                required
                min={0}
                value={state.store_age_months || ''}
                onChange={(e) => update('store_age_months', Number(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="YoY growth rate (%)">
              <input
                type="number"
                required
                value={state.growth_rate_yoy_pct}
                onChange={(e) => update('growth_rate_yoy_pct', Number(e.target.value))}
                className="input"
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <SliderField
              label="Customer retention"
              value={state.customer_retention_pct}
              onChange={(v) => update('customer_retention_pct', v)}
            />
            <SliderField
              label="Top customer concentration"
              value={state.customer_concentration_pct}
              onChange={(v) => update('customer_concentration_pct', v)}
            />
            <SliderField
              label="Recurring revenue"
              value={state.recurring_revenue_pct}
              onChange={(v) => update('recurring_revenue_pct', v)}
            />
            <SliderField
              label="Gross margin"
              value={state.gross_margin_pct}
              onChange={(v) => update('gross_margin_pct', v)}
            />
            <SliderField
              label="Niche specialization"
              value={state.niche_specialization_level}
              onChange={(v) => update('niche_specialization_level', v)}
              max={5}
              suffix=""
            />
          </>
        )}

        {step === 3 && (
          <Field label="Email">
            <input
              type="email"
              required
              value={state.email}
              onChange={(e) => update('email', e.target.value)}
              className="input"
              placeholder="you@store.com"
            />
            <p className="mt-1 text-xs text-gray-500">We'll send your results here and save your valuation.</p>
          </Field>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-4">
          {step > 0 && (
            <button type="button" onClick={back} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700">
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
              Next
            </button>
          ) : (
            <button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
              {submitting ? 'Calculating…' : 'Get Free Valuation'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function SliderField({
  label,
  value,
  onChange,
  max = 100,
  suffix = '%',
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-sm font-medium text-gray-700">
        <span>{label}</span>
        <span className="text-emerald-600">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-600"
      />
    </label>
  );
}
