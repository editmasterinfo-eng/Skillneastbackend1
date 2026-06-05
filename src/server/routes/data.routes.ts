import { Router } from 'express';
import { rtdb } from '../firebase';

export const dataRoutes = Router();

// /api/categories
dataRoutes.get('/categories', async (req, res) => {
  try {
    const snapshot = await rtdb.ref('categories').once('value');
    const data = snapshot.val();
    res.json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// /api/bundles
dataRoutes.get('/bundles', async (req, res) => {
  try {
    const snapshot = await rtdb.ref('bundles').once('value');
    const data = snapshot.val();
    res.json(data);
  } catch (error) {
    console.error('Error fetching bundles:', error);
    res.status(500).json({ error: 'Failed to fetch bundles' });
  }
});

// /api/library
dataRoutes.get('/library', async (req, res) => {
  try {
    // If getting the whole library is required, this will work.
    // If this needs user authentication, we can add auth middleware here later if asked.
    const snapshot = await rtdb.ref('library').once('value');
    const data = snapshot.val();
    res.json(data);
  } catch (error) {
    console.error('Error fetching library:', error);
    res.status(500).json({ error: 'Failed to fetch library' });
  }
});
