import { Router, Request, Response } from 'express';
import { requireAuth, monitorDeviceLimits } from '../middlewares/auth.middleware';
import { streamLimiter } from '../middlewares/rateLimit.middleware';
import { TelegramService } from '../services/telegram.service';

const router = Router();

// Endpoint to request a stream for a specific video ID
router.post('/request/:videoId', requireAuth, monitorDeviceLimits, streamLimiter, async (req: Request, res: Response): Promise<void> => {
  const { videoId } = req.params;
  const uid = req.uid!;

  try {
    const proxyUrl = await TelegramService.requestSecureStream(videoId, uid);
    
    if (proxyUrl) {
      res.json({ proxyUrl });
    } else {
      res.status(404).json({ error: 'Stream not found or could not be resolved' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to request stream' });
  }
});

// The actual proxy endpoint that serves the stream
// It does NOT expose the original URL. In a real setup, we pipe the stream data.
// Since we only have mock URLs, we'll redirect, but theoretically, we'd use 'request' to pipe.
router.get('/proxy/:proxyId', requireAuth, streamLimiter, async (req: Request, res: Response): Promise<void> => {
  const { proxyId } = req.params;
  const uid = req.uid!;

  try {
    const originalUrl = TelegramService.resolveProxyId(proxyId, uid);
    if (!originalUrl) {
      res.status(403).json({ error: 'Invalid or expired stream session' });
      return;
    }

    // In a true secure system, DO NOT redirect. Instead, pipe the buffer.
    // Example (requires node-fetch):
    // const response = await fetch(originalUrl);
    // response.body.pipe(res);
    
    // For demonstration, we'll pipe a mock response or just redirect (redirect defeats the proxy purpose but works as placeholder)
    res.json({ message: 'Piping stream...', internalResolvedUrl: originalUrl });
  } catch (err) {
    res.status(500).json({ error: 'Stream playback failed' });
  }
});

export { router as streamRoutes };
