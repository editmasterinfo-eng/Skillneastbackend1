import { Router, Request, Response } from 'express';

const router = Router();

router.get('/dashboard', (req: Request, res: Response) => {
  const instance = req.query.instance;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    status: "ONLINE",
    roundTrip: "1ms",
    networkLink: "ADMINNEAST-DEFAULT-RTDB",
    stats: { 
      sectorLoad: "0.51 GB", sectorLoadPercent: "5.1%", 
      localIngress: "32.4k", localIngressPercent: "3.2%", 
      localEgress: "3.2k", localEgressPercent: "32.4%", 
      socketDensity: "2", socketDensityPercent: "2.0%" 
    },
    specs: {
      region: "US-CENTRAL1-GCP",
      protocol: "BLAZE_PREMIUM_V2",
      capability: "100 ACTIVE SOCKETS",
      interface: "GRPC_OVER_JSON"
    }
  });
});

export default router;
