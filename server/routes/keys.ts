import { Router, Request, Response } from 'express';
import { db, admin } from '../firebase';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('licenses').get();
    const content = snapshot.docs.map(doc => ({ key: doc.id, ...doc.data() }));
    content.sort((a: any, b: any) => {
      const tA = a.generatedAt?._seconds || 0;
      const tB = b.generatedAt?._seconds || 0;
      return tB - tA;
    });
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch keys history' });
  }
});

router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, count } = req.body;
    const keysCount = Math.min(50, Math.max(1, Number(count) || 5));
    const generatedKeys = [];
    
    const batch = db.batch();
    for (let i = 0; i < keysCount; i++) {
        const randomSlug = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
                           Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
                           Math.random().toString(36).substring(2, 6).toUpperCase();
        const secureKey = `SECURE-KEY-${randomSlug}`;
        
        const keyRef = db.collection('licenses').doc(secureKey);
        batch.set(keyRef, {
            type: type || 'premium',
            status: 'fresh',
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            usedBy: null,
            usedAt: null
        });
        generatedKeys.push(secureKey);
    }
    
    await batch.commit();
    res.status(201).json({ success: true, keys: generatedKeys });
  } catch (err) {
    res.status(500).json({ error: 'Failed to batch generate secure credentials' });
  }
});

router.delete('/:keyId', async (req: Request, res: Response): Promise<void> => {
  try {
    const keyId = req.params.keyId;
    await db.collection('licenses').doc(keyId).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke key' });
  }
});

export default router;
