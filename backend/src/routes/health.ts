import { Router } from 'express';
import { supabase } from '../db/supabase';

const router = Router();

router.get('/', async (req, res) => {
  const { error } = await supabase.from('comps').select('id').limit(1);

  res.json({
    status: 'ok',
    database_connected: !error,
    timestamp: new Date().toISOString(),
  });
});

export default router;
