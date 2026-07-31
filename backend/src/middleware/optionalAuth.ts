import { NextFunction, Request, Response } from 'express';
import { resolveUser } from '../services/auth';

// Attaches req.user when a valid token is present, but never blocks the request.
// Used by public/free-tier endpoints that upgrade behavior for logged-in users.
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;

  if (token) {
    const user = await resolveUser(token);
    if (user) req.user = user;
  }

  next();
}
