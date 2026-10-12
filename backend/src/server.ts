import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import healthRouter from './routes/health';
import authRouter from './routes/auth';
import storesRouter from './routes/stores';
import valuationsRouter from './routes/valuations';
import compsRouter from './routes/comps';
import listingsRouter from './routes/listings';
import marketplaceIndexRouter from './routes/marketplaceIndex';
import savedDealsRouter from './routes/savedDeals';
import trackedNichesRouter from './routes/trackedNiches';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// FRONTEND_URL is a comma-separated list of allowed origins. A `*` matches one
// hostname label fragment, so Vercel preview URLs can be allowed with e.g.
// https://fairvalue-mvp-*-fair-value1.vercel.app
const allowedOrigins = FRONTEND_URL.split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean)
  .map((o) => new RegExp('^' + o.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[a-z0-9-]+') + '$'));

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.some((re) => re.test(origin)));
    },
  })
);
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/stores', storesRouter);
app.use('/api/valuations', valuationsRouter);
app.use('/api/comps', compsRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/marketplace-index', marketplaceIndexRouter);
app.use('/api/users/saved-deals', savedDealsRouter);
app.use('/api/users/tracked-niches', trackedNichesRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`FairValue API listening on port ${PORT}`);
});
