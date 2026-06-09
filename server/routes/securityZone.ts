import { Router, Request, Response } from 'express';

const router = Router();

router.get('/dashboard', (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    toggles: { antiDebug: false, ddos: true, botBlocker: true, geo: false, stealth: false, blob: true, inhibitSave: false },
    stats: {
      breachAttempts: [ { time: "5:15 PM", initial: "G", id: "UID_STR", type: "RIGHT CLICK ATTEMPT" } ],
      blacklistedEntities: [ { name: "RSTY", uid: "xyz_uid_string", reason: "SYSTEM_FRAUD" } ]
    }
  });
});

router.post('/update-protocols', (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ success: true, message: "Protocols updated" });
});

router.post('/restore-access', (req: Request, res: Response) => {
  const { uid } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ success: true, message: `Access restored for ${uid}` });
});

router.post('/kill-switch', (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ success: true, message: "Kill switch activated" });
});

export default router;
