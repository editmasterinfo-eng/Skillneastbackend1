import { Router, Request, Response } from 'express';
import { db } from '../firebase';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Public - Claim Daily Streak
router.post('/claim-streak', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: 'Missing userId' });
      return;
    }

    await db.runTransaction(async (t) => {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await t.get(userRef);
      if (!userDoc.exists) throw new Error('User not found');
      
      const userData = userDoc.data() || {};
      const currentStreak = userData.streakDay || 0;
      const newStreak = currentStreak + 1;
      
      // Fetch dynamic streak rewards configuration from settings
      const settingsDoc = await t.get(db.collection('settings').doc('system'));
      let rewardAmount = 10; // base fallback reward
      if (settingsDoc.exists) {
        const streakRewards = settingsDoc.data()?.streakRewards || {};
        // Find if they hit a milestone, otherwise give base reward
        rewardAmount = streakRewards[newStreak.toString()] || 10;
      }

      const currentCoins = userData.coins || 0;
      
      t.update(userRef, {
        streakDay: newStreak,
        coins: currentCoins + rewardAmount,
        lastStreakClaim: Date.now()
      });
      
      // Log economy event securely
      const logRef = db.collection(`economy_logs`).doc(userId).collection('transactions').doc();
      t.set(logRef, {
        action: 'STREAK_CLAIM',
        amount: rewardAmount,
        timestamp: Date.now(),
        operatorUid: 'system_auto'
      });
    });

    res.json({ success: true, message: 'Streak claimed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to claim streak' });
  }
});

// Public - Spend Coins to Unlock Vault Plans
router.post('/unlock-vault', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, planId, cost } = req.body;
    if (!userId || !planId || typeof cost !== 'number') {
      res.status(400).json({ error: 'Missing parameters' });
      return;
    }

    await db.runTransaction(async (t) => {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await t.get(userRef);
      if (!userDoc.exists) throw new Error('User not found');

      const currentCoins = userDoc.data()?.coins || 0;
      if (currentCoins < cost) throw new Error('Insufficient coins to unlock this plan');

      // Deduct coins
      t.update(userRef, {
        coins: currentCoins - cost
      });

      // Grant Access
      const unlockRef = db.collection('users').doc(userId).collection('unlockedPlans').doc(planId);
      t.set(unlockRef, {
        unlockedAt: Date.now(),
        planId
      });
      
      // Log economy event
      const logRef = db.collection(`economy_logs`).doc(userId).collection('transactions').doc();
      t.set(logRef, {
        action: 'VAULT_PURCHASE',
        amount: -cost, // negative for spend
        timestamp: Date.now(),
        planId,
        operatorUid: 'system_auto'
      });
    });

    res.json({ success: true, message: 'Vault plan unlocked' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Admin - Fetch Total Bank / Total Capital Ledger
router.get('/admin/ledger', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const usersSnapshot = await db.collection('users').get();
    let totalCapital = 0;
    let activeWallets = 0;
    
    usersSnapshot.forEach(doc => {
      const coins = doc.data().coins || 0;
      totalCapital += coins;
      if (coins > 0) activeWallets++;
    });
    
    res.json({ 
        totalCapital,
        activeWallets,
        status: 'synced_with_firebase'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch global ledger' });
  }
});

export default router;
