import { Router } from 'express';
import { supabase } from '../db/supabase';
import { optionalAuth } from '../middleware/optionalAuth';
import { calculateValuation } from '../services/valuation';
import { StoreInput } from '../types';

const router = Router();

router.post('/', optionalAuth, async (req, res) => {
  const { store_id } = req.body ?? {};
  if (!store_id) {
    return res.status(400).json({ error: 'store_id is required' });
  }

  const { data: store, error: storeError } = await supabase.from('stores').select('*').eq('id', store_id).maybeSingle();
  if (storeError || !store) {
    return res.status(404).json({ error: 'Store not found' });
  }

  try {
    const valuation = await calculateValuation(store as StoreInput);

    const { data: valuationRow, error: valuationError } = await supabase
      .from('valuations')
      .insert({
        store_id,
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

    res.status(201).json({ ...valuation, valuation_id: valuationRow.id });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/:valuation_id', async (req, res) => {
  const { valuation_id } = req.params;

  const { data: valuation, error } = await supabase.from('valuations').select('*, stores(*)').eq('id', valuation_id).maybeSingle();
  if (error || !valuation) {
    return res.status(404).json({ error: 'Valuation not found' });
  }

  res.json(valuation);
});

export default router;
