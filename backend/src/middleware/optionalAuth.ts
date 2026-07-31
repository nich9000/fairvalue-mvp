import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../services/auth';

// Attaches req.user when a valid token is present, but never blocks the request.
// Used by public/free-tier endpoints that upgrade behavior for logged-in users.
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;

  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // ignore invalid token, treat as anonymous
    }
  }

  next();
}
