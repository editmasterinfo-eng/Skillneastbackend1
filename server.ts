import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { globalLimiter } from './src/server/middlewares/rateLimit.middleware';
import { adminRoutes } from './src/server/routes/admin.routes';
import { userRoutes } from './src/server/routes/user.routes';
import { streamRoutes } from './src/server/routes/stream.routes';

async function startServer() {
  const app = express();
  const PORT = 3000;

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
      // Allow requests with no origin (like mobile apps or curl requests)
      // For strict frontend tie, you'd reject !origin unless it's a mobile app
      if (!origin || allowedOrigins.includes(origin) || origin.includes('run.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
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

  // Mapped routers
  app.use('/api/admin', adminRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/stream', streamRoutes);

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
