import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to verify admin authorization header.
 * In production, you would verify a JWT or a secure session.
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: true, code: 401, message: 'Authorization required. Please provide a valid admin token.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Strictly check against the environment variable. Fail securely if not set.
  if (!process.env.ADMIN_SECRET || token !== process.env.ADMIN_SECRET) {
    res.status(403).json({ error: true, code: 403, message: 'Forbidden: Invalid administrative credentials.' });
    return;
  }

  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
     res.status(401).json({ error: true, code: 401, message: 'Authorization required. Please provide a valid user token.' });
     return;
  }

  // Simplified token check for student/user (using token as uid for demo, or verify real jwt)
  const token = authHeader.split(' ')[1];
  (req as any).user = { uid: token }; // Mocking decoded token info

  next();
};

