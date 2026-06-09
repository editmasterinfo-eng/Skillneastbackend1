import { Router, Request, Response } from 'express';
import { db } from '../firebase';

const router = Router();

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const coursesSnap = await db.collection('courses').get();
    const courses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));

    const data = {
      metrics: {
        grossEngagement: 25,
        activeOscillations: 0
      },
      assetCore: {
        searchCoordinates: courses.map((c, index) => ({
          id: c.id || `item_${index}`,
          entityLabel: c.title ? c.title.toUpperCase() : "DIGITAL LAUNCHPAD",
          resourceStatus: "RESOURCE_VERIFIED",
          magSignal: 25,
          statusId: "STND_BY",
          accessControlStatus: "LOCK_ENGAGED",
          isLocked: true
        }))
      }
    };
    
    // Provide default data if the query yields empty results
    if (data.assetCore.searchCoordinates.length === 0) {
      data.assetCore.searchCoordinates = [
        {
          id: "item_1",
          entityLabel: "DIGITAL LAUNCHPAD",
          resourceStatus: "RESOURCE_VERIFIED",
          magSignal: 25,
          statusId: "STND_BY",
          accessControlStatus: "LOCK_ENGAGED",
          isLocked: true
        }
      ];
    }
    
    // Explicit global CORS header just in case for this specific route
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.json(data);
  } catch (error) {
    console.error('Imam Gadzhi Dashboard Error:', error);
    res.status(500).json({ error: 'Failed to fetch asset core data' });
  }
});

export default router;
