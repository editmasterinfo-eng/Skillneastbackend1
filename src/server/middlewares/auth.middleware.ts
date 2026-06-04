import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../firebase';
import jwt from 'jsonwebtoken';

// Extend Express Request
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
    uid?: string;
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // 1. Try resolving with Firebase Auth (standard users)
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
      req.uid = decodedToken.uid;
      next();
    } catch (firebaseError) {
      // 2. Alternatively, try resolving with local JWT (e.g., custom premium or admin sessions)
      const secret = process.env.JWT_SECRET;
      if (secret) {
        try {
          const decodedJwt = jwt.verify(token, secret) as any;
          req.user = decodedJwt;
          req.uid = decodedJwt.uid;
          next();
          return;
        } catch (jwtError) {
          // Both failed
          res.status(401).json({ error: 'Unauthorized: Invalid token' });
          return;
        }
      } else {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error in Authentication' });
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await requireAuth(req, res, () => {});
    if (res.headersSent) return;

    // Verify admin role via custom claim or Firestore DB
    if (req.user?.admin === true) {
      next();
      return;
    }

    // Fallback: Check if UID exists in /admins collection
    if (req.uid) {
      const adminDoc = await db.collection('admins').doc(req.uid).get();
      if (adminDoc.exists) {
        next();
        return;
      }
    }
    
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Middleware to track IP & device for preventing account sharing
export const monitorDeviceLimits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.uid) return next();

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Simplistic fingerprint using IP + UA (in real-world, a stronger client-side fingerprint is sent)
    const deviceId = `${ip}-${userAgent}`; 
    
    const userRef = db.collection('users').doc(req.uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const devices = userData?.devices || [];
      
      if (!devices.includes(deviceId)) {
        if (devices.length >= 2) {
          // Block if max devices (2) exceeded
           res.status(403).json({ error: 'Device limit exceeded. Please logout from other devices.' });
           return;
        }
        // Register new device
        await userRef.update({
          devices: [...devices, deviceId]
        });
      }
    }
    
    next();
  } catch (err) {
    console.error(err);
    next();
  }
};
