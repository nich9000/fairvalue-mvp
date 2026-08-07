import { Router } from 'express';
import { supabase } from '../db/supabase';
import { requireAuth } from '../middleware/auth';
import { matchesFilters } from '../lib/matchListing';

const router = Router();
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

router.get('/', requireAuth, async (req, res) => {
  const { data: niches, error } = await supabase
    .from('user_tracked_niches')
    .select('*')
    .eq('user_id', req.user!.user_id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const { data: active } = await supabase
    .from('marketplace_listings')
    .select('source_marketplace, platform, niche_category, annual_revenue, multiple_achieved, listed_date')
    .eq('listing_status', 'active');

  const cutoff = Date.now() - SEVEN_DAYS_MS;
  const withCounts = (niches ?? []).map((n) => {
    const matches = (active ?? []).filter((l) => matchesFilters(l, n));
    const new_this_week = matches.filter((l) => l.listed_date && new Date(l.listed_date).getTime() >= cutoff).length;
    return { ...n, matching_count: matches.length, new_this_week };
  });

  res.json({ tracked_niches: withCounts });
});

router.post('/', requireAuth, async (req, res) => {
  const { label, marketplace, platform, category, niche, revenue_min, revenue_max, multiple_min, multiple_max } = req.body ?? {};

  const { data, error } = await supabase
    .from('user_tracked_niches')
    .insert({
      user_id: req.user!.user_id,
      label: label || 'All listings',
      marketplace: marketplace || null,
      platform: platform || null,
      category: category || null,
      niche: niche || null,
      revenue_min: revenue_min ?? null,
      revenue_max: revenue_max ?? null,
      multiple_min: multiple_min ?? null,
      multiple_max: multiple_max ?? null,
    })
    .select('*')
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ success: true, tracked_niche: data });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from('user_tracked_niches').delete().eq('id', id).eq('user_id', req.user!.user_id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true });
});

export default router;
