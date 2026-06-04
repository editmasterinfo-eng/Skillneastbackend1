import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middlewares/auth.middleware';
import { db, admin } from '../firebase';

const router = Router();

router.use(requireAdmin);

// 1. Manage Courses
router.post('/courses', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;
    const docRef = await db.collection('courses').add({
      title,
      description,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

router.post('/videos', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, title, telegramLink } = req.body;
    const docRef = await db.collection('videos').add({
      courseId,
      title,
      telegramLink,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add video' });
  }
});

// 2. Generate Premium Licenses/Keys
router.post('/keys/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, count } = req.body; // e.g. type: 'monthly', count: 10
    const keys = [];
    
    // Batch create for performance
    const batch = db.batch();
    for (let i = 0; i < count; i++) {
        // Generate a random 16-char alphanumeric key
        const newKey = Math.random().toString(36).substring(2, 10).toUpperCase() + 
                       Math.random().toString(36).substring(2, 10).toUpperCase();
        
        const keyRef = db.collection('licenses').doc(newKey);
        batch.set(keyRef, {
            type: type || 'premium',
            status: 'fresh', // 'fresh' or 'used'
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            usedBy: null,
            usedAt: null
        });
        keys.push(newKey);
    }
    
    await batch.commit();
    res.status(201).json({ keys });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate keys' });
  }
});

export { router as adminRoutes };
