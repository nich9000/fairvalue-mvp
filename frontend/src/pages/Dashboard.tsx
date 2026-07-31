import { useState } from 'react';
import ValuationChart from '../components/ValuationChart';
import Auth from '../components/Auth';

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('fairvalue_user_id'));

  if (!userId) {
    return <Auth onSuccess={setUserId} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Hi there 👋</h1>
      <p className="text-sm text-gray-500">Here's how your store is trending.</p>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Valuation over time</h2>
        <ValuationChart data={[]} />
      </section>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Improvement tracker</h2>
        <p className="text-sm text-gray-500">Complete a valuation to start tracking your improvement metrics.</p>
      </section>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Your store vs. similar stores</h2>
        <p className="text-sm text-gray-500">Benchmarks will appear here once you have a saved valuation.</p>
      </section>

      <button
        type="button"
        disabled
        title="Coming soon"
        className="mt-6 w-full rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-500 opacity-60"
      >
        Download PDF report — coming soon
      </button>
    </div>
  );
}
