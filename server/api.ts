import { Router, Request, Response } from 'express';
import { requireAdmin } from './middleware/auth';
import { db, admin, rtdb } from './firebase';

import usersRoutes from './routes/users';
import analyticsRoutes from './routes/analytics';
import contentRoutes from './routes/content';
import keysRoutes from './routes/keys';
import settingsRoutes from './routes/settings';

const router = Router();

// ==========================================
// 0. Auto-Seeder: Pre-populate blank Firestore database
// ==========================================
async function ensureSeeds() {
  try {
    // 0.1 Check & Seed Settings Document
    const sysSettingsDoc = await db.collection('settings').doc('system').get();
    if (!sysSettingsDoc.exists) {
      await db.collection('settings').doc('system').set({
        storageLimit: 250,
        backupDomain: 'https://backup.securecourseapi.com',
        maintenanceMode: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    const popupDoc = await db.collection('settings').doc('activePopup').get();
    if (!popupDoc.exists) {
      await db.collection('settings').doc('activePopup').set({
        message: '💡 System Notice: Enterprise streaming proxy servers are synchronized.',
        active: true,
        type: 'info',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // 0.2 Check & Seed Users Collection
    const usersSnapshot = await db.collection('users').limit(1).get();
    if (usersSnapshot.empty) {
      const mockUsers = [
        {
          name: 'Ishaan Verma',
          email: 'ishaan.verma@example.com',
          lastIp: '103.241.12.89',
          device: 'macOS / Chrome 124',
          isPremium: true,
          isBlocked: false,
          isOnline: true,
          coins: 450,
          location: { latitude: 28.6139, longitude: 77.2090 },
          country: 'India',
          city: 'Delhi',
          lastSeen: new Date().toISOString()
        }
      ];
      for (const u of mockUsers) { await db.collection('users').add(u); }
    }

    // 0.3 Check & Seed Courses
    const coursesSnapshot = await db.collection('courses').limit(1).get();
    if (coursesSnapshot.empty) {
      const mockCourses = [
        {
          title: 'Iman Gadzhi - Agency Navigator',
          description: 'Blueprint to SMMA success.',
          category: 'Agency SMMA',
          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        }
      ];
      for (const c of mockCourses) { await db.collection('courses').add(c); }
    }
  } catch (err) {
    console.error('Auto-seeding experienced an error:', err);
  }
}

// Initialize seed data
ensureSeeds();

// ==========================================
// 1. Role Update & Privilege Escalation (Security)
// ==========================================
router.post('/update-role', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: true, code: 401, message: 'Missing or invalid authorization header' });
      return;
    }
    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      // In a real environment, we verify the Firebase ID Token
      decodedToken = await admin.auth().verifyIdToken(idToken);
      if (decodedToken.role !== 'admin' && decodedToken.admin !== true) {
        throw new Error('Forbidden: Insufficient privileges.');
      }
    } catch (firebaseErr: any) {
      // FALLBACK: strict admin token check
      if (!process.env.ADMIN_SECRET || idToken !== process.env.ADMIN_SECRET) {
        res.status(403).json({ error: true, code: 403, message: 'Forbidden: Insufficient privileges or invalid token.' });
        return;
      }
      decodedToken = { uid: 'system_admin', admin: true };
    }

    const { targetUid, newRole } = req.body;
    if (!targetUid || !newRole) {
      res.status(400).json({ error: true, code: 400, message: 'Missing targetUid or newRole payload' });
      return;
    }

    // 1. Set Custom User Claims mapped to the target user via Firebase Auth
    try {
      await admin.auth().setCustomUserClaims(targetUid, { role: newRole, admin: newRole === 'admin' });
    } catch (e: any) {
      console.error('Firebase Auth setCustomUserClaims failed (ignoring for simulated users):', e.message);
    }

    // 2. Update the Realtime Database user role object directly
    try {
      if (rtdb) {
        await rtdb.ref(`users/${targetUid}/role`).set(newRole);
      }
    } catch (rtdbErr: any) {
      console.error('RTDB update role failed:', rtdbErr.message);
    }
    
    // 3. Fallback duplicate it in Firestore for the dashboard queries
    await db.collection('users').doc(targetUid).set({ role: newRole }, { merge: true });

    res.json({ success: true, message: `Successfully escalated ${targetUid} to ${newRole}` });
  } catch (error: any) {
    console.error('Role update error:', error);
    res.status(500).json({ error: true, code: 500, message: 'Failed to update role' });
  }
});

// Middleware to protect all other legacy routes in /api/admin
router.use(requireAdmin);

// Define admin sub-routes
router.use('/users', usersRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/content', contentRoutes);
router.use('/keys', keysRoutes);
router.use('/settings', settingsRoutes);

export default router;

