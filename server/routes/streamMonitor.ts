import { Router, Request, Response } from 'express';
import os from 'os';

const router = Router();

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const memoryUsage = process.memoryUsage().rss / 1024 / 1024;
    const cpuLoads = os.loadavg();
    const cpuLoad = cpuLoads[0] * 10; // Simple approximation for demonstration

    const now = new Date();
    const timeStr = now.toLocaleTimeString();

    const data = {
      serverStatus: {
        nodeTarget: "skillneaststream.onrender.com",
        nodeStatus: "Unreachable",
        realtimeLatency: "Timeout"
      },
      metrics: {
        concurrentViewers: { value: 0, max: 200, unit: "Users" },
        cpuLoad: { value: Number(cpuLoad.toFixed(1)), max: 100, unit: "%" },
        memoryUsage: { value: Number(memoryUsage.toFixed(1)), max: 512, unit: "MB" },
        bandwidthOut: { value: 0, max: 1000, unit: "Mbps" }
      },
      activePlaybackSessions: {
        connectedCount: 0,
        sessions: [] 
      },
      loadBalancer: {
        requestThroughput: "0 req/s",
        cacheHitRatio: 98.5,
        proxyEndpoint: "https://neastogstream.domking26800.workers.dev/"
      },
      terminalLogs: [
        `[${timeStr}] 192.168.102.14 - POST /chunk/v_01.m4s 200 12ms`,
        `[${now.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(' ', ' ')}] 192.168.72.61 - GET /chunk/v_01.m4s 204 40ms`,
        `[${now.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(' ', ' ')}] 192.168.239.144 - POST /chunk/v_01.m4s 304 29ms`
      ]
    };
    
    // Explicit global CORS header just in case for this specific route
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.json(data);
  } catch (error) {
    console.error('Stream Monitor Error:', error);
    res.status(500).json({ error: 'Failed to fetch stream monitor data' });
  }
});

export default router;
