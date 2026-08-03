import { Router } from 'express';
import { supabase } from '../db/supabase';

const router = Router();

router.get('/', async (req, res) => {
  const { platform, fulfillment, traffic } = req.query;

  if (!platform) {
    return res.status(400).json({ error: 'platform is required' });
  }

  let query = supabase.from('marketplace_pricing_index').select('*').eq('platform', platform as string);
  if (fulfillment) query = query.eq('fulfillment_model', fulfillment as string);
  if (traffic) query = query.eq('traffic_channel', traffic as string);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  res.json({ segments: data ?? [] });
});

export default router;
