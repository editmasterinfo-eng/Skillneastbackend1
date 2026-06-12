import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to verify admin authorization header.
 * In production, you would verify a JWT or a secure session.
 * For this dashboard, we check a specific static header or 'Bearer admin123'
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization required. Please provide a valid admin token.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Simple static check for demo / provided default
  if (token !== 'admin123' && token !== process.env.ADMIN_SECRET) {
    res.status(403).json({ error: 'Forbidden: Invalid administrative credentials.' });
    return;
  }

  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
     res.status(401).json({ error: 'Authorization required. Please provide a valid user token.' });
     return;
  }

  // Simplified token check for student/user (using token as uid for demo, or verify real jwt)
  const token = authHeader.split(' ')[1];
  (req as any).user = { uid: token }; // Mocking decoded token info

  next();
};

