import { Router, Request, Response } from 'express';
import { db } from '../firebase';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Public - Fetch comments by content ID
router.get('/content/:contentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('comments')
      .where('contentId', '==', req.params.contentId)
      //.where('status', '==', 'active') // Only show active comments
      .orderBy('timestamp', 'desc')
      .get();
      
    // Filter active comments client side or after fetch if composite index not configured
    const comments = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((c: any) => c.status === 'active');
      
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Public - Post new comment
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, userName, contentId, text } = req.body;
    if (!userId || !contentId || !text) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    const docRef = db.collection('comments').doc();
    await docRef.set({
      id: docRef.id,
      userId,
      userName: userName || 'Anonymous',
      contentId,
      text,
      timestamp: Date.now(),
      status: 'active'
    });
    
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// Admin - Fetch all platform comments for moderation
router.get('/admin/all', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('comments').orderBy('timestamp', 'desc').get();
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all comments' });
  }
});

// Admin - Delete comment
router.delete('/admin/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await db.collection('comments').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Admin - Flag comment
router.patch('/admin/:id/flag', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await db.collection('comments').doc(req.params.id).update({ status: 'flagged' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to flag comment' });
  }
});

export default router;
