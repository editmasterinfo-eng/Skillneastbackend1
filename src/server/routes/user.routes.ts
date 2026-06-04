import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { db, admin } from '../firebase';

const router = Router();

router.use(requireAuth);

// Get User Profile & Stats (coins, streaks)
router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const userDoc = await db.collection('users').doc(req.uid!).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const data = userDoc.data();
    // Exclude internal devices list to frontend
    if (data && data.devices) {
      delete data.devices;
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Validate & Consume License Key
router.post('/activate-key', async (req: Request, res: Response): Promise<void> => {
  const { key } = req.body;
  if (!key) {
    res.status(400).json({ error: 'License key is required' });
    return;
  }

  try {
    const keyRef = db.collection('licenses').doc(key);
    
    // Use transaction to ensure anti-cheat and atomic consumption
    const result = await db.runTransaction(async (t) => {
        const keyDoc = await t.get(keyRef);
        
        if (!keyDoc.exists) {
            throw new Error('Invalid key');
        }
        
        const keyData = keyDoc.data();
        if (keyData?.status !== 'fresh') {
            throw new Error('Key has already been used');
        }
        
        // Mark key used
        t.update(keyRef, {
            status: 'used',
            usedBy: req.uid,
            usedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Update user premium status
        const userRef = db.collection('users').doc(req.uid!);
        t.set(userRef, {
            isPremium: true,
            premiumSince: admin.firestore.FieldValue.serverTimestamp(),
            subscriptionType: keyData.type
        }, { merge: true });
        
        return 'success';
    });
    
    res.json({ message: 'License key activated successfully', status: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Key validation failed' });
  }
});

// Update watch progress & streak (server-side protection)
router.post('/progress', async (req: Request, res: Response): Promise<void> => {
    const { videoId, progressSeconds } = req.body;
    
    try {
        const progressRef = db.collection('users').doc(req.uid!).collection('progress').doc(videoId);
        
        await db.runTransaction(async (t) => {
             const progDoc = await t.get(progressRef);
             let currentSeconds = progDoc.exists ? progDoc.data()?.progressSeconds || 0 : 0;
             
             // Simple anti-cheat: user shouldn't skip massive time blocks instantly.
             // Realistically, you'd check last updated time compared to new time.
             const jump = progressSeconds - currentSeconds;
             if (jump > 300) { 
                 // Assuming max 5 mins jump between ping
                 console.warn(`Suspicious progress jump by user ${req.uid}`);
                 // Cap the jump or reject entirely
                 res.status(400).json({ error: 'Invalid progress tracked detected cheating' });
                 return;
             }
             
             t.set(progressRef, {
                 progressSeconds,
                 lastUpdated: admin.firestore.FieldValue.serverTimestamp()
             }, { merge: true });
        });
        
        res.json({ message: 'Progress updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

export { router as userRoutes };
