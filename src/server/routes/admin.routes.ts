import { Router, Request, Response, NextFunction } from 'express';
import { requireAdmin } from '../middlewares/auth.middleware';
import { db, admin } from '../firebase';

const router = Router();

// Middleware to protect all routes in this file
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
        storageLimit: 250, // GB
        backupDomain: 'https://backup.securecourseapi.com',
        maintenanceMode: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    const popupDoc = await db.collection('settings').doc('activePopup').get();
    if (!popupDoc.exists) {
      await db.collection('settings').doc('activePopup').set({
        message: '💡 System Notice: Enterprise streaming proxy servers are synchronized. High-throughput rate limiters active.',
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
          location: { latitude: 28.6139, longitude: 77.2090 }, // Delhi, India
          country: 'India',
          city: 'Delhi',
          lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 mins ago
        },
        {
          name: 'Sarah Connor',
          email: 'sarah.c@example.com',
          lastIp: '8.8.8.8',
          device: 'iOS 17.4 / Mobile Safari',
          isPremium: false,
          isBlocked: false,
          isOnline: true,
          coins: 120,
          location: { latitude: 37.7749, longitude: -122.4194 }, // SF, USA
          country: 'United States',
          city: 'San Francisco',
          lastSeen: new Date(Date.now() - 50 * 1000).toISOString() // 50s ago
        },
        {
          name: 'Yuki Tanaka',
          email: 'yuki.t@example.jp',
          lastIp: '110.50.64.12',
          device: 'Windows 11 / Edge 122',
          isPremium: true,
          isBlocked: false,
          isOnline: false,
          coins: 1250,
          location: { latitude: 35.6762, longitude: 139.6503 }, // Tokyo, Japan
          country: 'Japan',
          city: 'Tokyo',
          lastSeen: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
        },
        {
          name: 'Amara Diop',
          email: 'amara.diop@example.sn',
          lastIp: '196.207.240.5',
          device: 'Android 14 / Chrome Mobile',
          isPremium: false,
          isBlocked: true,
          isOnline: false,
          coins: 0,
          location: { latitude: 14.7167, longitude: -17.4677 }, // Dakar, Senegal
          country: 'Senegal',
          city: 'Dakar',
          lastSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        }
      ];

      for (const u of mockUsers) {
        await db.collection('users').add(u);
      }
    }

    // 0.3 Check & Seed Courses Collection
    const coursesSnapshot = await db.collection('courses').limit(1).get();
    if (coursesSnapshot.empty) {
      const mockCourses = [
        {
          title: 'Iman Gadzhi - Agency Navigator',
          description: 'The ultimate blueprint to building a high-ticket SMMA agency from scratch.',
          category: 'Agency SMMA',
          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          title: 'Full-Stack Software Engineering Masterclass',
          description: 'Learn enterprise software architecture using Node, Express, TypeScript, and Firebase Firestore.',
          category: 'Programming',
          imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          title: 'Advanced Financial Risk Management',
          description: 'Technical chart reading, long-term options strategy, and portfolio allocations.',
          category: 'Finance & Trading',
          imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        }
      ];

      for (const c of mockCourses) {
        await db.collection('courses').add(c);
      }
    }

    // 0.4 Check & Seed Key Licenses Collection
    const licSnapshot = await db.collection('licenses').limit(1).get();
    if (licSnapshot.empty) {
      const mockKeys = [
        { key: 'SECURE-KEY-8941-XDFG', type: 'premium', status: 'fresh', usedBy: null, usedAt: null },
        { key: 'SECURE-KEY-3312-PLKM', type: 'premium', status: 'fresh', usedBy: null, usedAt: null },
        { key: 'SECURE-KEY-1109-ERTY', type: 'premium', status: 'used', usedBy: 'yuki-tanaka-uid', usedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() }
      ];

      for (const k of mockKeys) {
        const { key, ...rest } = k;
        await db.collection('licenses').doc(key).set({
          ...rest,
          generatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    // 0.5 Check & Seed Stored Files/Resource Assets
    const filesSnapshot = await db.collection('files').limit(1).get();
    if (filesSnapshot.empty) {
      const mockFiles = [
        { fileName: 'iman_agency_navigator_pdf_manual.pdf', url: 'https://example.com/assets/navigator_manual.pdf', size: 12582912, fileType: 'pdf', uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { fileName: 'entrepreneurship_mindset_audio.mp3', url: 'https://example.com/assets/mindset_audio.mp3', size: 48234496, fileType: 'audio', uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { fileName: 'database_schema_blueprint_visual_map.png', url: 'https://example.com/assets/visual_map.png', size: 5242880, fileType: 'image', uploadedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() }
      ];

      for (const f of mockFiles) {
        await db.collection('files').add({
          ...f,
          uploadedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    // 0.6 Check & Seed User Events Collection
    const eventsSnapshot = await db.collection('events').limit(1).get();
    if (eventsSnapshot.empty) {
      const mockEvents = [
        { email: 'ishaan.verma@example.com', type: 'login', event: '👤 User logged in securely from recognized device', ip: '103.241.12.89', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
        { email: 'sarah.c@example.com', type: 'stream', event: '🎥 Started streaming: Episode 1: Enterprise Setup', ip: '8.8.8.8', timestamp: new Date(Date.now() - 50 * 1000).toISOString() },
        { email: 'yuki.t@example.jp', type: 'key_activate', event: '🔑 Activated Premium license: SECURE-KEY-1109-ERTY', ip: '110.50.64.12', timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
        { email: 'amara.diop@example.sn', type: 'block', event: '🚨 Account auto-suspended: Multiple concurrent user agents', ip: '196.207.240.5', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
      ];

      for (const ev of mockEvents) {
        await db.collection('events').add({
          ...ev,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
  } catch (err) {
    console.error('Auto-seeding experienced an error:', err);
  }
}

// Ensure database is populated upon starting server/first api checks
ensureSeeds();

// ==========================================
// 1. User Management & Coins System
// ==========================================

// Get all users
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update/Add specific user directly
router.post('/users', async (req: Request, res: Response): Promise<void> => {
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
router.post('/users/:id/action', async (req: Request, res: Response): Promise<void> => {
  try {
    const { action } = req.body; // 'premium', 'standard', 'block', 'unblock', 'delete'
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
router.post('/users/:id/coins', async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, type } = req.body; // type: 'add' or 'deduct'
    const userId = req.params.id;
    const userRef = db.collection('users').doc(userId);

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(userRef);
      if (!doc.exists) {
        throw new Error("User does not exist!");
      }

      const currentCoins = doc.data()?.coins || 0;
      let newCoins = currentCoins;
      if (type === 'add') newCoins += Number(amount);
      if (type === 'deduct') newCoins = Math.max(0, currentCoins - Number(amount));

      transaction.update(userRef, { coins: newCoins });
    });

    res.json({ success: true, message: `Coins updated` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to manage coins' });
  }
});

// ==========================================
// 2. Analytics, Tracking & Geo Map
// ==========================================

// Live User Tracking (With load indicator)
router.get('/analytics/live', async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('users').get();
    const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    
    // Split users into active and inactive
    const liveUsers = allUsers.filter(u => u.isOnline === true);
    
    // Simulate real server metrics
    const baseServerLoad = liveUsers.length * 8 + Math.floor(Math.random() * 5); // stable CPU ratio
    res.json({
      activeCount: liveUsers.length || 2, // backup fallback if none online in dev mock
      serverCpuUsage: `${Math.min(98, Math.max(2, baseServerLoad))}%`,
      apiThroughput: `${12 + liveUsers.length * 4} req/sec`,
      activeUsers: liveUsers.length > 0 ? liveUsers : allUsers.slice(0, 2)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch live analytics' });
  }
});

// Geo Map Data
router.get('/analytics/geo', async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('users').get();
    const geoLocations = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        userId: doc.id,
        name: data.name || 'Anonymous',
        city: data.city || 'Unknown',
        country: data.country || 'Unknown',
        latitude: data.location?.latitude || 20.5937, // India/Center general fallback
        longitude: data.location?.longitude || 78.9629,
        coins: data.coins || 0,
        isPremium: data.isPremium || false
      };
    });
    res.json(geoLocations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch geo data' });
  }
});

// Behavior & Retention Log Events
router.get('/analytics/behavior', async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('events').orderBy('timestamp', 'desc').limit(100).get();
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(events);
  } catch (error) {
    // If indexing is currently generating, return mock events or raw list
    try {
      const snapshotNoOrder = await db.collection('events').limit(100).get();
      const events = snapshotNoOrder.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(events);
    } catch (_) {
      res.status(500).json({ error: 'Failed to fetch behavior logs' });
    }
  }
});

// ==========================================
// 3. Content Management System (CMS)
// ==========================================

// Get all courses
router.get('/cms/courses', async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('courses').get();
    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Create/Update Course
router.post('/cms/courses', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, title, description, category, imageUrl } = req.body;
    if (id) {
      await db.collection('courses').doc(id).update({ 
        title, 
        description, 
        category, 
        imageUrl, 
        updatedAt: admin.firestore.FieldValue.serverTimestamp() 
      });
      res.json({ success: true, id });
    } else {
      const docRef = await db.collection('courses').add({
        title, 
        description, 
        category: category || 'General', 
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.status(201).json({ success: true, id: docRef.id });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to save course' });
  }
});

// Delete Course
router.delete('/cms/courses/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await db.collection('courses').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// File Asset Library Management
router.get('/cms/files', async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('files').get();
    const files = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch files catalog' });
  }
});

router.post('/cms/files', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName, url, size, fileType } = req.body;
    if (!fileName || !url) {
       res.status(400).json({ error: 'fileName and url are required' });
       return;
    }
    const docRef = await db.collection('files').add({
      fileName,
      url,
      size: Number(size) || 1024,
      fileType: fileType || 'file',
      uploadedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register file asset' });
  }
});

router.delete('/cms/files/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await db.collection('files').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete file asset' });
  }
});

// Popups & Announcements
router.post('/cms/popups', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, active, type } = req.body;
    await db.collection('settings').doc('activePopup').set({ 
      message, 
      active: Boolean(active), 
      type: type || 'info', 
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set popup announcement' });
  }
});

router.get('/cms/popups', async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await db.collection('settings').doc('activePopup').get();
    res.json(doc.exists ? doc.data() : { active: false, message: '', type: 'info' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get welcome popup' });
  }
});

// ==========================================
// 4. Key Generator & Premium Access
// ==========================================

router.get('/keys', async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('licenses').get();
    const content = snapshot.docs.map(doc => ({ key: doc.id, ...doc.data() }));
    // Sort client-side if server index isn't ready immediately
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

// Generate dynamic secure coupon access codes
router.post('/keys/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, count } = req.body; // e.g. type: 'premium', count: 10
    const keysCount = Math.min(50, Math.max(1, Number(count) || 5));
    const generatedKeys = [];
    
    // Batch write to ensure high commitment
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

// Delete specific license key
router.delete('/keys/:keyId', async (req: Request, res: Response): Promise<void> => {
  try {
    const keyId = req.params.keyId;
    await db.collection('licenses').doc(keyId).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke key' });
  }
});

// ==========================================
// 5. System Settings & Communications
// ==========================================

router.get('/settings', async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await db.collection('settings').doc('system').get();
    res.json(doc.exists ? doc.data() : { storageLimit: 250, backupDomain: '', maintenanceMode: false });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch system configurations' });
  }
});

router.post('/settings', async (req: Request, res: Response): Promise<void> => {
  try {
    const { storageLimit, backupDomain, maintenanceMode } = req.body;
    await db.collection('settings').doc('system').set({ 
      storageLimit: Number(storageLimit) || 100, 
      backupDomain: backupDomain || '', 
      maintenanceMode: Boolean(maintenanceMode), 
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    }, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update system configurations' });
  }
});

// Dispatch real-time server messages
router.post('/notifications', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, body, target } = req.body; // target: 'all', or custom group
    if (!title || !body) {
       res.status(400).json({ error: 'Title and body are required' });
       return;
    }
    
    const docRef = await db.collection('notifications').add({
      title, 
      body, 
      target: target || 'all', 
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Log dispatch operation to behavior table
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

export { router as adminRoutes };
