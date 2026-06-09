import { Router, Request, Response } from 'express';
import { db, admin } from '../firebase';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await db.collection('settings').doc('system').get();
    res.json(doc.exists ? doc.data() : { 
      storageLimit: 250, 
      backupDomain: '', 
      maintenanceMode: false,
      onboardingPayload: {},
      vaultPlans: [],
      premiumNexus: {},
      premiumPropaganda: {},
      premiumTiers: []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch system configurations' });
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      storageLimit, 
      backupDomain, 
      maintenanceMode, 
      onboardingPayload, 
      vaultPlans, 
      premiumNexus, 
      premiumPropaganda, 
      premiumTiers 
    } = req.body;
    
    await db.collection('settings').doc('system').set({ 
      storageLimit: Number(storageLimit) || 100, 
      backupDomain: backupDomain || '', 
      maintenanceMode: Boolean(maintenanceMode),
      ...(onboardingPayload && { onboardingPayload }),
      ...(vaultPlans && { vaultPlans }),
      ...(premiumNexus && { premiumNexus }),
      ...(premiumPropaganda && { premiumPropaganda }),
      ...(premiumTiers && { premiumTiers }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    }, { merge: true });
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update system configurations' });
  }
});

router.post('/notify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, body, target } = req.body;
    if (!title || !body) {
       res.status(400).json({ error: 'Title and body are required' });
       return;
    }
    
    const docRef = await db.collection('notifications').add({
      title, body, target: target || 'all', 
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await db.collection('events').add({
      email: 'SYSTEM_BROADCAST',
      type: 'notification',
      event: `📢 Broadcast dispatched: "${title}" -> ${target || 'all'}`,
      ip: req.ip || '127.0.0.1',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to dispatch broadcast notice' });
  }
});

export default router;
