import { Router } from 'express';
import { supabase } from '../db/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const { status } = req.query;

  const { data: saved, error } = await supabase
    .from('user_saved_deals')
    .select('*, marketplace_listings(*)')
    .eq('user_id', req.user!.user_id)
    .order('saved_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  let results = saved ?? [];
  if (status === 'active' || status === 'sold') {
    results = results.filter((row: any) => row.marketplace_listings?.listing_status === status);
  }

  res.json({ saved_deals: results });
});

router.post('/', requireAuth, async (req, res) => {
  const { listing_id, notes } = req.body ?? {};
  if (!listing_id) {
    return res.status(400).json({ error: 'listing_id is required' });
  }

  const { data, error } = await supabase
    .from('user_saved_deals')
    .upsert({ user_id: req.user!.user_id, listing_id, notes }, { onConflict: 'user_id,listing_id' })
    .select('*')
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ success: true, saved_deal_id: data.id });
});

router.delete('/:listing_id', requireAuth, async (req, res) => {
  const { listing_id } = req.params;

  const { error } = await supabase
    .from('user_saved_deals')
    .delete()
    .eq('user_id', req.user!.user_id)
    .eq('listing_id', listing_id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true });
});

export default router;
