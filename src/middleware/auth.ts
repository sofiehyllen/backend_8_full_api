// Who is asking, and may they.

import { Request, Response, NextFunction } from 'express';
import { Claims, verifyToken } from '../auth/crypto.js';

// From the structured API exercises: one fixed token for everybody, from
// .env. Task 2 replaces it with requireAuth, and then you delete it.
export function requireToken(req: Request, res: Response, next: NextFunction): void {
  const expected = process.env.API_TOKEN;
  if (!expected || req.get('Authorization') !== `Bearer ${expected}`) {
    res.status(401).json({ error: 'missing or wrong token' });
    return;
  }
  next();
}

// Task 2 - authentication.
//
// Read the token from "Authorization: Bearer <token>" and check it with
// verifyToken. No token, or one that verifyToken does not accept: 401, and
// the chain stops. Otherwise put the claims on res.locals.user and call
// next().
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // TODO
  res.status(501).json({ error: 'not implemented' });
}

// Task 3 - authorization by role.
//
// Returns a middleware that lets the request through only when the user that
// requireAuth put on res.locals.user has this role, and answers 403
// otherwise. It always runs after requireAuth.
export function requireRole(role: string) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    // TODO
    res.status(501).json({ error: 'not implemented' });
  };
}
