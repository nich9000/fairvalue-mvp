import fs from 'fs';
import path from 'path';
import { supabase } from './supabase';

interface CompRow {
  sale_price: number;
  annual_revenue: number;
  annual_profit: number;
  multiple_achieved: number;
  platform: string;
  niche_category: string;
  growth_rate_yoy_pct: number;
  customer_retention_pct: number;
  gross_margin_pct: number;
  sold_date: string;
  source: string;
  is_verified: boolean;
  data_quality_score: number;
}

function parseCsv(filePath: string): CompRow[] {
  const raw = fs.readFileSync(filePath, 'utf-8').trim();
  const [headerLine, ...lines] = raw.split(/\r?\n/);
  const headers = headerLine.split(',');

  return lines
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const cells = line.split(',');
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h.trim()] = (cells[i] ?? '').trim();
      });

      return {
        sale_price: Number(row.sale_price),
        annual_revenue: Number(row.annual_revenue),
        annual_profit: Number(row.annual_profit),
        multiple_achieved: Number(row.multiple_achieved),
        platform: row.platform,
        niche_category: row.niche_category,
        growth_rate_yoy_pct: Number(row.growth_rate_yoy_pct),
        customer_retention_pct: Number(row.customer_retention_pct),
        gross_margin_pct: Number(row.gross_margin_pct),
        sold_date: row.sold_date,
        source: row.source,
        is_verified: row.is_verified?.toUpperCase() === 'TRUE',
        data_quality_score: Number(row.data_quality_score),
      };
    });
}

async function seed() {
  const csvPath = path.join(__dirname, 'seed_data', 'comps.csv');
  const rows = parseCsv(csvPath);

  console.log(`Parsed ${rows.length} comps rows from ${csvPath}`);

  const { error: deleteError } = await supabase.from('comps').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error('Failed to clear existing comps:', deleteError.message);
    process.exit(1);
  }

  const { data, error } = await supabase.from('comps').insert(rows).select('id');

  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }

  console.log(`Inserted ${data?.length ?? 0} comps rows.`);
  process.exit(0);
}

seed();
