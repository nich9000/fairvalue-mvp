import { Router } from 'express';
import { supabase } from '../db/supabase';
import { requireAuth } from '../middleware/auth';
import { optionalAuth } from '../middleware/optionalAuth';
import { calculateValuation } from '../services/valuation';
import { StoreInput } from '../types';

const router = Router();

const VALID_PLATFORMS = ['Shopify', 'Etsy', 'Amazon FBA', 'WooCommerce', 'Other'];

function validateStoreInput(body: Partial<StoreInput>): string | null {
  if (!body.store_name || typeof body.store_name !== 'string') return 'store_name is required';
  if (!body.platform || !VALID_PLATFORMS.includes(body.platform)) {
    return `platform must be one of ${VALID_PLATFORMS.join(', ')}`;
  }
  if (typeof body.annual_revenue !== 'number' || body.annual_revenue <= 0) {
    return 'annual_revenue must be a positive number';
  }
  const numericFields: (keyof StoreInput)[] = [
    'annual_profit',
    'store_age_months',
    'customer_retention_pct',
    'customer_concentration_pct',
    'growth_rate_yoy_pct',
    'gross_margin_pct',
    'recurring_revenue_pct',
    'niche_specialization_level',
  ];
  for (const field of numericFields) {
    if (typeof body[field] !== 'number' || Number.isNaN(body[field] as number)) {
      return `${field} must be a number`;
    }
  }
  return null;
}

router.post('/', optionalAuth, async (req, res) => {
  const validationError = validateStoreInput(req.body ?? {});
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const input = req.body as StoreInput;

  try {
    const storeFields = {
      store_name: input.store_name,
      platform: input.platform,
      annual_revenue: input.annual_revenue,
      annual_profit: input.annual_profit,
      store_age_months: input.store_age_months,
      customer_concentration_pct: input.customer_concentration_pct,
      customer_retention_pct: input.customer_retention_pct,
      gross_margin_pct: input.gross_margin_pct,
      recurring_revenue_pct: input.recurring_revenue_pct,
      growth_rate_yoy_pct: input.growth_rate_yoy_pct,
      niche_specialization_level: input.niche_specialization_level,
    };

    let { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({ user_id: req.user?.user_id ?? null, ...storeFields })
      .select('*')
      .single();

    // A cached token for a since-deleted account trips the FK constraint — fall back to anonymous.
    if (storeError?.code === '23503' && req.user) {
      ({ data: store, error: storeError } = await supabase
        .from('stores')
        .insert({ user_id: null, ...storeFields })
        .select('*')
        .single());
    }

    if (storeError || !store) throw new Error(storeError?.message ?? 'Failed to create store');

    const valuation = await calculateValuation(input);

    const { data: valuationRow, error: valuationError } = await supabase
      .from('valuations')
      .insert({
        store_id: store.id,
        base_multiple: valuation.base_multiple,
        base_valuation: valuation.base_valuation,
        final_valuation_low: valuation.final_valuation_low,
        final_valuation_high: valuation.final_valuation_high,
        confidence_score: valuation.confidence_score,
        improvement_opportunities: valuation.improvement_opportunities,
      })
      .select('*')
      .single();

    if (valuationError || !valuationRow) throw new Error(valuationError?.message ?? 'Failed to save valuation');

    res.status(201).json({
      store_id: store.id,
      valuation: { ...valuation, valuation_id: valuationRow.id },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/:store_id', async (req, res) => {
  const { store_id } = req.params;

  const { data: store, error: storeError } = await supabase.from('stores').select('*').eq('id', store_id).maybeSingle();
  if (storeError || !store) {
    return res.status(404).json({ error: 'Store not found' });
  }

  const { data: valuation } = await supabase
    .from('valuations')
    .select('*')
    .eq('store_id', store_id)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  res.json({ store, valuation: valuation ?? null });
});

router.patch('/:store_id/claim', requireAuth, async (req, res) => {
  const { store_id } = req.params;

  const { data: store, error: storeError } = await supabase.from('stores').select('id, user_id').eq('id', store_id).maybeSingle();
  if (storeError || !store) {
    return res.status(404).json({ error: 'Store not found' });
  }
  if (store.user_id && store.user_id !== req.user!.user_id) {
    return res.status(403).json({ error: 'Store already belongs to another account' });
  }

  const { error: updateError } = await supabase.from('stores').update({ user_id: req.user!.user_id }).eq('id', store_id);
  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  res.json({ store_id, claimed: true });
});

export default router;
