import { Router, Request, Response } from 'express';
import { db } from '../firebase';

const router = Router();

// Get all users
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update/Add specific user directly
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, coins, isPremium, isBlocked, lastIp, device, country, city } = req.body;
    const docRef = await db.collection('users').add({
      name: name || 'Anonymous User',
      email: email,
      coins: coins || 0,
      isPremium: isPremium || false,
      isBlocked: isBlocked || false,
      lastIp: lastIp || '127.0.0.1',
      device: device || 'Web Browser',
      country: country || 'Unknown',
      city: city || 'Unknown',
      isOnline: false,
      lastSeen: new Date().toISOString()
    });
    res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// User Actions (premium, block, delete, unblock)
router.post('/:id/action', async (req: Request, res: Response): Promise<void> => {
  try {
    const { action } = req.body; 
    const userId = req.params.id;
    const userRef = db.collection('users').doc(userId);

    if (action === 'delete') {
      await userRef.delete();
      res.json({ success: true, message: 'User deleted' });
      return;
    }

    const updates: any = {};
    if (action === 'premium') updates.isPremium = true;
    if (action === 'standard') updates.isPremium = false;
    if (action === 'block') updates.isBlocked = true;
    if (action === 'unblock') updates.isBlocked = false;

    await userRef.update(updates);
    res.json({ success: true, message: `User updated successfully: ${action}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform user action' });
  }
});

// Coin Management API
router.post('/:id/coins', async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, type, operatorUid = 'system_admin' } = req.body; 
    const userId = req.params.id;
    const userRef = db.collection('users').doc(userId);

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(userRef);
      if (!doc.exists) {
        throw new Error("User does not exist!");
      }

      const currentCoins = doc.data()?.coins || 0;
      let newCoins = currentCoins;
      let actionType = 'CREDIT';
      
      if (type === 'add') {
        newCoins += Number(amount);
        actionType = 'CREDIT';
      }
      if (type === 'deduct') {
        newCoins = Math.max(0, currentCoins - Number(amount));
        actionType = 'REVOKE';
      }

      // Update user coins
      transaction.update(userRef, { coins: newCoins });
      
      // Log economy transaction
      const logRef = db.collection(`economy_logs`).doc(userId).collection('transactions').doc();
      transaction.set(logRef, {
        action: actionType,
        amount: Number(amount),
        timestamp: Date.now(),
        operatorUid: operatorUid
      });
    });

    res.json({ success: true, message: `Coins updated and economy logged` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to manage coins' });
  }
});

export default router;
