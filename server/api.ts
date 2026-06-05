import { Router } from 'express';
import { requireAdmin } from './middleware/auth';
import { db, admin } from './firebase';

import usersRoutes from './routes/users';
import analyticsRoutes from './routes/analytics';
import contentRoutes from './routes/content';
import keysRoutes from './routes/keys';
import settingsRoutes from './routes/settings';

const router = Router();

// Middleware to protect all routes in /api/admin
router.use(requireAdmin);

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

// Define admin sub-routes
router.use('/users', usersRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/content', contentRoutes);
router.use('/keys', keysRoutes);
router.use('/settings', settingsRoutes);

export default router;
