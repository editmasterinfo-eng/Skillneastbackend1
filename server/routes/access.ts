import { Router, Request, Response } from 'express';
import { rtdb } from '../firebase';
import crypto from 'crypto';
import { accessLimiter } from '../../src/server/middlewares/rateLimit.middleware';

const router = Router();

// POST /api/access/generate
router.post('/generate', accessLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.body.uid || 'anonymous';
    const token = crypto.randomUUID();
    const createdAt = Date.now();
    const expiresAt = createdAt + 24 * 60 * 60 * 1000; // 24 hours expiry
    
    await rtdb.ref(`accessTokens/${token}`).set({
      uid,
      createdAt,
      expiresAt,
      used: false
    });
    
    // In production, this should ideally be process.env.APP_URL
    const verifyUrl = `${process.env.APP_URL || 'https://skillneastbackend1.onrender.com'}/api/access/verify?token=${token}`;
    const base64Url = Buffer.from(verifyUrl).toString('base64');
    const linkvertiseId = process.env.LINKVERTISE_ID || '1146744'; 
    const linkvertiseRedirect = `https://link-to.net/${linkvertiseId}/?r=${base64Url}`;
    
    res.json({ success: true, redirectUrl: linkvertiseRedirect });
  } catch (error: any) {
    res.status(500).json({ error: true, code: 500, message: 'Failed to generate access token' });
  }
});

// POST /api/access/verify?token=TOKEN
router.all('/verify', accessLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const token = (req.query.token as string) || (req.body && req.body.token);
    const fingerprint = req.headers['x-device-fingerprint'] || req.body?.fingerprint || 'unknown';
    
    if (!token) {
      res.status(400).json({ error: true, code: 400, message: 'Token missing' });
      return;
    }
    
    const tokenRef = rtdb.ref(`accessTokens/${token}`);
    const snapshot = await tokenRef.once('value');
    
    if (!snapshot.exists()) {
      res.status(404).json({ error: true, code: 404, message: 'Invalid or expired token' });
      return;
    }
    
    const tokenData = snapshot.val();
    const now = Date.now();
    
    if (now > tokenData.expiresAt) {
      res.status(400).json({ error: true, code: 400, message: 'Invalid or expired token' });
      return;
    }
    
    // Strict one-time use check
    if (tokenData.used) {
      res.status(403).json({ error: true, code: 403, message: 'Token has already been used' });
      return;
    }
    
    // Mark as active and store fingerprint
    await tokenRef.update({ 
      used: true, 
      activatedAt: now,
      fingerprint: fingerprint
    });
    
    if (req.method === 'GET') {
      res.redirect(`/?access_token=${token}`);
    } else {
      res.json({ success: true, accessToken: token, expiresAt: tokenData.expiresAt });
    }
  } catch (error: any) {
    res.status(500).json({ error: true, code: 500, message: 'Failed to verify access token' });
  }
});

// GET /api/access/check
router.get('/check', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: true, code: 401, message: 'Missing Bearer token' });
      return;
    }
    
    const token = authHeader.split('Bearer ')[1];
    const clientFingerprint = req.headers['x-device-fingerprint'] || req.query?.fingerprint || 'unknown';
    
    const snapshot = await rtdb.ref(`accessTokens/${token}`).once('value');
    
    if (!snapshot.exists()) {
      res.status(401).json({ error: true, code: 401, message: 'Invalid token' });
      return;
    }
    
    const tokenData = snapshot.val();
    
    if (Date.now() > tokenData.expiresAt) {
      res.status(401).json({ error: true, code: 401, message: 'Token expired' });
      return;
    }

    // Fingerprint check if provided initially and now
    if (tokenData.fingerprint && tokenData.fingerprint !== 'unknown' && clientFingerprint !== 'unknown') {
      if (tokenData.fingerprint !== clientFingerprint) {
        res.status(403).json({ error: true, code: 403, message: 'Device fingerprint mismatch' });
        return;
      }
    }
    
    res.json({ valid: true, expiresAt: tokenData.expiresAt });
  } catch (error: any) {
    res.status(500).json({ error: true, code: 500, message: 'Failed to check access token' });
  }
});

export default router;
