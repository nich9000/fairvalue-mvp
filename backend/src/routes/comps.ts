import { Router } from 'express';
import { supabase } from '../db/supabase';
import { requireAuth } from '../middleware/auth';

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

// Auth-gated for MVP; there is no dedicated admin role yet, so any authenticated
// user can reseed. Intended for internal/admin use only.
router.post('/seed', requireAuth, async (req, res) => {
  const { comps_data } = req.body ?? {};
  if (!Array.isArray(comps_data) || comps_data.length === 0) {
    return res.status(400).json({ error: 'comps_data must be a non-empty array' });
  }

  const { data, error } = await supabase.from('comps').insert(comps_data).select('id');
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ inserted_count: data?.length ?? 0 });
});

export default router;
