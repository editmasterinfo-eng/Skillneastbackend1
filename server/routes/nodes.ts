import { Router, Request, Response } from 'express';
import { db } from '../firebase';

const router = Router();

// Endpoint 1: Register Node
router.post('/register', async (req: Request, res: Response) => {
  try {
     const { dbName, dbUrl, apiKey } = req.body;
     if (!dbName || !dbUrl || !apiKey) {
         return res.status(400).json({ error: 'Missing defined properties' });
     }
     
     // Securely encrypt the apiKey (Mock using base64 for demo)
     const encryptedKey = Buffer.from(apiKey).toString('base64');
     
     const docRef = db.collection('slave_nodes').doc();
     await docRef.set({
       id: docRef.id,
       dbName,
       dbUrl,
       encryptedKey,
       status: 'ONLINE',
       latency: Math.floor(Math.random() * 50) + 10,
       trafficDistribution: 0,
       createdAt: Date.now()
     });
     
     res.json({ success: true, id: docRef.id });
  } catch(e) {
     res.status(500).json({ error: 'Failed to register node', details: (e as Error).message });
  }
});

// Endpoint 2: Get Active Nodes
router.get('/', async (req: Request, res: Response) => {
  try {
     const snapshot = await db.collection('slave_nodes').get();
     let numNodes = snapshot.docs.length;
     // Fallback if none to prevent division by zero visually
     if (numNodes === 0) numNodes = 1;
     
     const nodes = snapshot.docs.map(doc => {
       const data = doc.data();
       return {
         id: doc.id,
         dbName: data.dbName,
         dbUrl: data.dbUrl,
         status: data.status || 'ONLINE',
         latency: `${data.latency || 25}ms`,
         trafficDistribution: `${Math.floor(100 / numNodes)}%`,
         // hide encrypted key for security
       };
     });
     
     res.json(nodes);
  } catch(e) {
     res.status(500).json({ error: 'Failed' });
  }
});

// Endpoint 3: Delete Node
router.delete('/:nodeId', async (req: Request, res: Response) => {
  try {
     await db.collection('slave_nodes').doc(req.params.nodeId).delete();
     res.json({ success: true, message: 'Gracefully detached Slave Node.' });
  } catch(e) {
     res.status(500).json({ error: 'Failed', details: (e as Error).message });
  }
});

export default router;
