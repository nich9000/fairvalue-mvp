import { NextFunction, Request, Response } from 'express';
import { resolveUser } from '../services/auth';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const user = await resolveUser(token);
  if (!user) {
    return res.status(401).json({ error: 'Your session is no longer valid. Please log in again.' });
  }

  req.user = user;
  next();
}
