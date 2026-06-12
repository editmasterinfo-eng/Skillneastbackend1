import { Router, Request, Response } from 'express';
import { rtdb } from '../firebase';
import crypto from 'crypto';

const router = Router();

// POST /api/access/generate
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.body.uid || 'anonymous';
    const token = crypto.randomUUID();
    const createdAt = Date.now();
    const expiresAt = createdAt + 12 * 60 * 60 * 1000; // 12 hours
    
    await rtdb.ref(`accessTokens/${token}`).set({
      uid,
      createdAt,
      expiresAt,
      used: false
    });
    
    const verifyUrl = `https://skillneastbackend1.onrender.com/api/access/verify?token=${token}`;
    const base64Url = Buffer.from(verifyUrl).toString('base64');
    // Using a placeholder Linkvertise ID if not set in env
    const linkvertiseId = process.env.LINKVERTISE_ID || '1146744'; 
    const linkvertiseRedirect = `https://link-to.net/${linkvertiseId}/?r=${base64Url}`;
    
    res.json({ success: true, redirectUrl: linkvertiseRedirect });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate access token', details: error.message });
  }
});

// POST /api/access/verify?token=TOKEN (also supporting GET for fallback redirect behavior)
router.all('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = (req.query.token as string) || (req.body && req.body.token);
    
    if (!token) {
      res.status(400).json({ success: false, error: 'Token missing' });
      return;
    }
    
    const tokenRef = rtdb.ref(`accessTokens/${token}`);
    const snapshot = await tokenRef.once('value');
    
    if (!snapshot.exists()) {
      res.status(404).json({ success: false, error: 'Invalid or expired token' });
      return;
    }
    
    const tokenData = snapshot.val();
    const now = Date.now();
    
    if (now > tokenData.expiresAt) {
      res.status(400).json({ success: false, error: 'Invalid or expired token' });
      return;
    }
    
    // Mark as active if used
    if (!tokenData.used) {
      await tokenRef.update({ used: true, activatedAt: now });
    }
    
    if (req.method === 'GET') {
      // In case they click directly and linkvertise redirects them as GET
      res.redirect(`/?access_token=${token}`);
    } else {
      res.json({ success: true, accessToken: token, expiresAt: tokenData.expiresAt });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to verify access token' });
  }
});

// GET /api/access/check
router.get('/check', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ valid: false, error: 'Missing Bearer token' });
      return;
    }
    
    const token = authHeader.split('Bearer ')[1];
    const snapshot = await rtdb.ref(`accessTokens/${token}`).once('value');
    
    if (!snapshot.exists()) {
      res.json({ valid: false });
      return;
    }
    
    const tokenData = snapshot.val();
    
    if (Date.now() > tokenData.expiresAt) {
      res.json({ valid: false });
      return;
    }
    
    res.json({ valid: true, expiresAt: tokenData.expiresAt });
  } catch (error: any) {
    res.status(500).json({ valid: false, error: 'Failed to check access token' });
  }
});

export default router;
