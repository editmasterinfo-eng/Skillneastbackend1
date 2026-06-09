import { Router, Request, Response } from 'express';
import { db } from '../firebase';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Public facing - Submit DMCA
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { copyrightOwner, infringingUrl, description } = req.body;
    if (!copyrightOwner || !infringingUrl || !description) {
      res.status(400).json({ error: 'Missing required DMCA fields' });
      return;
    }
    
    const docRef = db.collection('dmca_reports').doc();
    await docRef.set({
      id: docRef.id,
      copyrightOwner,
      infringingUrl,
      description,
      timestamp: Date.now(),
      status: 'pending'
    });
    
    res.json({ success: true, message: 'DMCA claim submitted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit DMCA claim' });
  }
});

// Admin - Fetch DMCA reports
router.get('/admin/all', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('dmca_reports').orderBy('timestamp', 'desc').get();
    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch DMCA reports' });
  }
});

// Admin - Delete DMCA report (Resolved)
router.delete('/admin/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await db.collection('dmca_reports').doc(req.params.id).delete();
    res.json({ success: true, message: 'DMCA report resolved and deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete DMCA report' });
  }
});

export default router;
