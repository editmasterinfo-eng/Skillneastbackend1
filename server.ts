import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { globalLimiter } from './src/server/middlewares/rateLimit.middleware';
import adminRouterModular from './server/api';
import systemAnalyticsRoutes from './server/routes/systemAnalytics';
import streamMonitorRoutes from './server/routes/streamMonitor';
import imamGadzhiRoutes from './server/routes/imamGadzhi';
import serverNodesRoutes from './server/routes/serverNodes';
import firebaseHealthRoutes from './server/routes/firebaseHealth';
import securityZoneRoutes from './server/routes/securityZone';
import geoMapRoutes from './server/routes/geoMap';
import dmcaRoutes from './server/routes/dmca';
import commentsRoutes from './server/routes/comments';
import economyRoutes from './server/routes/economy';
import syncRoutes from './server/routes/sync';
import nodesRoutes from './server/routes/nodes';
import botRoutes from './server/routes/bot';
import { userRoutes } from './src/server/routes/user.routes';
import { streamRoutes } from './src/server/routes/stream.routes';
import { dataRoutes } from './src/server/routes/data.routes';

import { startRiskProfileJob } from './server/jobs/riskProfileJob';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Start background jobs
  startRiskProfileJob();

  // 1. Security Middlewares
  app.use(helmet({
    // Need to relax CSP for Vite HMR in development if applicable, but good for prod
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  }));
  
  // CORS Configuration: Only allow specific frontend domain (or self in this case)
  // Disable direct external access from unknown domains
  const allowedOrigins = [
      process.env.APP_URL, 
      'http://localhost:3000',
      'http://localhost:5173'
  ].filter(Boolean) as string[];

  app.use(cors({
    origin: (origin, callback) => {
      // ONLY ALLOW skillneast.vercel.app, local dev, and AI Studio
      if (!origin || allowedOrigins.includes(origin) || origin === 'https://skillneast.vercel.app' || origin.includes('run.app')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by Strict CORS Policy: Unauthorized origin'));
      }
    },
    credentials: true,
  }));

  // JSON parsing and Rate Limiting
  app.use(express.json());
  app.use(globalLimiter);

  // 2. API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Secure Course API is running.' });
  });

  app.get('/api/system/metrics', cors(), async (req, res) => {
    try {
      const pidusage = (await import('pidusage')).default;
      const stats = await pidusage(process.pid);
      
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      // Normalize CPU to 0-100 range per core roughly
      const cpu = Math.round(stats.cpu * 10) / 10; 
      // Memory in MB
      const memory = Math.round(stats.memory / 1024 / 1024 * 10) / 10; 
      
      // Mock tracking numbers logic for realism
      const activeUsers = Math.floor(Math.random() * (140 - 100 + 1) + 100); 
      const latency = Math.floor(Math.random() * (50 - 25 + 1) + 25); 
      
      // Explicit global CORS header just in case for this specific route
      res.setHeader('Access-Control-Allow-Origin', '*');

      res.json({
        timestamp: `${hours}:${minutes}:${seconds}`,
        cpu: isNaN(cpu) ? 0 : cpu,
        memory: isNaN(memory) ? 0 : memory,
        activeUsers,
        latency
      });
    } catch (error) {
      console.error('Metrics error:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  // Mapped routers
  app.use('/api/admin', adminRouterModular);
  app.use('/api/system-analytics', systemAnalyticsRoutes);
  app.use('/api/stream-monitor', streamMonitorRoutes);
  app.use('/api/imam-gadzhi', imamGadzhiRoutes);
  app.use('/api/server-nodes', serverNodesRoutes);
  app.use('/api/firebase-health', firebaseHealthRoutes);
  app.use('/api/security', securityZoneRoutes);
  app.use('/api/geo-map', geoMapRoutes);
  app.use('/api/dmca', dmcaRoutes);
  app.use('/api/comments', commentsRoutes);
  app.use('/api/economy', economyRoutes);
  app.use('/api/sync', syncRoutes);
  app.use('/api/nodes', nodesRoutes);
  app.use('/api/bot', botRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/stream', streamRoutes);
  app.use('/api', dataRoutes);

  // 3. Vite Middleware (Fallback for SPA)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
