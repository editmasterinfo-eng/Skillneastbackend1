import { Router, Request, Response } from 'express';

const router = Router();

router.get('/dashboard', (req: Request, res: Response) => {
  // Explicit CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    summary: { totalRequests: 78, activeNodes: 2 },
    nodes: [
      { id: 1, domain: "skillneaststream.onrender.com", status: "Online", latency: "387ms", requests: 16, load: "21%", errors: 0 }
    ],
    requestLogs: [
      { time: "4:03 PM", user: "WTReBl", route: "direct", latency: "12ms" }
    ]
  });
});

router.post('/deploy', (req: Request, res: Response) => {
  const { url } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ success: true, message: "Deployed to " + url });
});

router.post('/backup-domain', (req: Request, res: Response) => {
  const { domain } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ success: true, message: "Backup domain updated to " + domain });
});

export default router;
