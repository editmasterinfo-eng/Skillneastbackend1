import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per `window`
  message: { error: true, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per `window`
  message: { error: true, message: 'Too many authentication requests from this IP, please try again later.' },
});

export const accessLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 access requests per `window`
  message: { error: true, message: 'Too many access generation/verification attempts from this IP, please try again later.' },
});

export const streamLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 stream requests per minute to prevent scraping
  message: { error: true, message: 'Too many stream requests, slow down.' },
});
