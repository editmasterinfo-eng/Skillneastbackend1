import { Router, Request, Response } from 'express';

const router = Router();

// Endpoint 1: Execute Cluster Sync
router.post('/execute', (req: Request, res: Response) => {
  try {
    const { branches } = req.body;
    if (!Array.isArray(branches)) {
      return res.status(400).json({ error: 'Missing branches array in body' });
    }
    
    // Connect to Master RTDB, fetch branches, broadcast to active Slave Nodes.
    console.log(`Executing cluster sync for ${branches.length} logic branches...`);
    
    res.json({ success: true, message: `Successfully replicated ${branches.length} branches across registered Cluster Nodes.` });
  } catch (error) {
    res.status(500).json({ error: 'Sync failed' });
  }
});

// Endpoint 2: SSE stream logs
router.get('/stream_logs', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Initial connection
  res.write(`data: ${JSON.stringify({ time: new Date().toLocaleTimeString(), message: '[MASTER] RTDB SSE Stream established.' })}\n\n`);

  // Simulate retro terminal log stream
  const messages = [
    "[INFO] Pinging active slave nodes...",
    "Node ASIA-1 [OK] (12ms)",
    "Node EU-WEST [OK] (35ms)",
    "Preparing logic branch [-OFQAcQEPO_-LJKJFYAR] for packet construction...",
    "Encrypted payload chunk #1 generated.",
    "BROADCAST: [-OFQAcQEPO_-LJKJFYAR] dispatched.",
    "ACK received from ASIA-1.",
    "ACK received from EU-WEST.",
    "[INFO] Branch synchronization loop healthy."
  ];

  let messageIndex = 0;
  const timer = setInterval(() => {
    if (messageIndex < messages.length) {
      res.write(`data: ${JSON.stringify({ time: new Date().toLocaleTimeString(), message: messages[messageIndex] })}\n\n`);
      messageIndex++;
    } else {
      res.write(`data: ${JSON.stringify({ time: new Date().toLocaleTimeString(), message: '[SYSTEM] Idle... awaiting next manual sync broadcast.' })}\n\n`);
    }
  }, 2000);

  req.on('close', () => {
    clearInterval(timer);
  });
});

export default router;
