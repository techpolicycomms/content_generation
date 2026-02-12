import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Error]', err.message);

  if (err.message === 'Invalid credentials') {
    return res.status(401).json({ error: err.message });
  }

  if (err.message === 'User not found') {
    return res.status(404).json({ error: err.message });
  }

  if (err.message === 'Email already registered') {
    return res.status(409).json({ error: err.message });
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
