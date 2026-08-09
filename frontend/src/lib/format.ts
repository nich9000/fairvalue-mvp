export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatMultiple(value: number): string {
  return `${value.toFixed(2)}x`;
}

// Compact "$500K" / "$1.2M" style, for stat tiles — formatCurrency's full comma-separated
// output ("$953,442") is too wide for a small number display.
export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `$${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  if (value >= 1_000) return `$${Math.round(value / 1000)}K`;
  return `$${Math.round(value)}`;
}

// value_score is % difference from the segment's median multiple (positive = priced below
// median = better value for a buyer). +/-5% is treated as noise rather than a real signal.
export function valueScoreLabel(score: number | null | undefined): { text: string; tone: 'good' | 'bad' | 'neutral' } | null {
  if (score === null || score === undefined) return null;
  if (score > 5) return { text: `${Math.round(score)}% below market multiple`, tone: 'good' };
  if (score < -5) return { text: `${Math.round(Math.abs(score))}% above market multiple`, tone: 'bad' };
  return { text: 'At market multiple', tone: 'neutral' };
}
