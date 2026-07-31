import { ImprovementOpportunity } from '../lib/api';

const DIFFICULTY_COLOR: Record<ImprovementOpportunity['difficulty'], string> = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

const METRIC_LABEL: Record<string, string> = {
  gross_margin: 'Gross Margin',
  customer_retention: 'Customer Retention',
  recurring_revenue: 'Recurring Revenue',
  growth_rate: 'YoY Growth Rate',
  customer_concentration: 'Customer Concentration',
  niche_specialization: 'Niche Specialization',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

const UNITLESS_METRICS = new Set(['niche_specialization']);

export default function MetricCard({ opportunity }: { opportunity: ImprovementOpportunity }) {
  const unit = UNITLESS_METRICS.has(opportunity.metric) ? '' : '%';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{METRIC_LABEL[opportunity.metric] ?? opportunity.metric}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLOR[opportunity.difficulty]}`}>
          {opportunity.difficulty}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
        <span>{opportunity.current.toFixed(0)}{unit}</span>
        <span aria-hidden>→</span>
        <span className="font-medium text-gray-900">{opportunity.potential_target.toFixed(0)}{unit}</span>
      </div>
      <div className="mt-3 text-lg font-bold text-emerald-600">+{formatCurrency(opportunity.value_gain)}</div>
      <div className="mt-1 text-xs text-gray-500">~{opportunity.timeline_weeks} weeks</div>
    </div>
  );
}
