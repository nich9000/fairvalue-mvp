import { Link } from 'react-router-dom';
import { MarketplaceListing } from '../lib/dealsApi';
import { formatCurrency, formatMultiple } from '../lib/format';

function dealLabel(score: number | null): { label: string; stars: number } {
  if (score === null) return { label: 'Unranked', stars: 0 };
  if (score >= 70) return { label: 'Best deal', stars: 5 };
  if (score >= 55) return { label: 'Good deal', stars: 4 };
  if (score >= 40) return { label: 'Fair deal', stars: 3 };
  return { label: 'Below average', stars: 2 };
}

export default function DealCard({ listing }: { listing: MarketplaceListing }) {
  const { label, stars } = dealLabel(listing.composite_score);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">{label}</span>
        <span className="text-amber-500" aria-hidden>
          {'★'.repeat(stars)}
          <span className="text-gray-300">{'★'.repeat(5 - stars)}</span>
        </span>
      </div>
      <h3 className="mt-2 truncate font-semibold text-gray-900">
        {listing.niche_category ?? 'E-commerce business'} · {listing.platform}
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        {formatCurrency(listing.listing_price)} asking · {formatCurrency(listing.annual_revenue)} revenue ·{' '}
        {formatMultiple(listing.multiple_achieved)}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        {listing.traffic_channel ?? 'traffic n/a'} · {listing.fulfillment_model ?? 'fulfillment n/a'}
        {listing.profit_margin_pct !== null ? ` · ${listing.profit_margin_pct.toFixed(0)}% margin` : ''}
      </p>
      <p className="mt-1 text-xs text-gray-400">
        {listing.listed_date ? `Listed ${listing.listed_date}` : ''} {listing.source_marketplace ? `(${listing.source_marketplace})` : ''}
      </p>
      <Link
        to={`/deals/${listing.id}`}
        className="mt-3 inline-block text-sm font-semibold text-emerald-600 hover:text-emerald-700"
      >
        View details →
      </Link>
    </div>
  );
}
