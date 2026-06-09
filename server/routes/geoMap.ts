import { Router, Request, Response } from 'express';

const router = Router();

router.get('/dashboard', (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    status: "success",
    activeVectors: 142,
    globalBandwidth: "1.2 TB/s",
    liveUsers: {
      user_1001: {
        name: "Alex",
        location: {
          lat: 40.7128,
          lon: -74.0060,
          city: "NEW YORK",
          country: "USA"
        }
      },
      user_1002: {
        name: "Sarah",
        location: {
          lat: 51.5074,
          lon: -0.1278,
          city: "LONDON",
          country: "UK"
        }
      },
      user_1003: {
        name: "Vikram",
        location: {
          lat: 19.0760,
          lon: 72.8777,
          city: "MUMBAI",
          country: "IND"
        }
      }
    }
  });
});

export default router;
