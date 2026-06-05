import { Router, Request, Response } from 'express';
import { db, admin } from '../firebase';

const router = Router();

// Get all courses
router.get('/courses', async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('courses').get();
    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Create/Update Course
router.post('/courses', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, title, description, category, imageUrl } = req.body;
    if (id) {
      await db.collection('courses').doc(id).update({ 
        title, description, category, imageUrl, 
        updatedAt: admin.firestore.FieldValue.serverTimestamp() 
      });
      res.json({ success: true, id });
    } else {
      const docRef = await db.collection('courses').add({
        title, description, category: category || 'General', 
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
router.delete('/courses/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await db.collection('courses').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// File Asset Library Management
router.get('/files', async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('files').get();
    const files = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch files catalog' });
  }
});

router.post('/files', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName, url, size, fileType } = req.body;
    if (!fileName || !url) {
       res.status(400).json({ error: 'fileName and url are required' });
       return;
    }
    const docRef = await db.collection('files').add({
      fileName, url, size: Number(size) || 1024, fileType: fileType || 'file',
      uploadedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register file asset' });
  }
});

router.delete('/files/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await db.collection('files').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete file asset' });
  }
});

// Popups & Announcements
router.post('/popups', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, active, type } = req.body;
    await db.collection('settings').doc('activePopup').set({ 
      message, active: Boolean(active), type: type || 'info', 
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set popup announcement' });
  }
});

router.get('/popups', async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await db.collection('settings').doc('activePopup').get();
    res.json(doc.exists ? doc.data() : { active: false, message: '', type: 'info' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get welcome popup' });
  }
});

export default router;
