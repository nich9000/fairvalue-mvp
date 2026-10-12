import { Router } from 'express';
import { supabase } from '../db/supabase';

const router = Router();

router.get('/', async (req, res) => {
  const { platform, niche, revenue_min, revenue_max } = req.query;

  let query = supabase.from('comps').select('*');

  if (platform) query = query.eq('platform', platform as string);
  if (niche) query = query.eq('niche_category', niche as string);
  if (revenue_min) query = query.gte('annual_revenue', Number(revenue_min));
  if (revenue_max) query = query.lte('annual_revenue', Number(revenue_max));

  const { data, error } = await query.limit(100);
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ comps: data ?? [] });
});

export default router;
