import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import urlRoutes from './routes/urlRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import {
  redirectShortUrl,
  unlockShortUrl,
} from './controllers/urlController.js';

import {
  generalRateLimiter,
  redirectRateLimiter,
} from './middleware/rateLimiter.js';

import {
  notFoundMiddleware,
  errorMiddleware,
} from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet()
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: '1mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  })
);

app.use(cookieParser());

app.use(morgan('dev'));

app.use(generalRateLimiter);


/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'URL Shortener API is running',
    timestamp: new Date().toISOString(),
  });
});


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/urls',
  urlRoutes
);

app.use(
  '/api/analytics',
  analyticsRoutes
);

app.use(
  '/api/admin',
  adminRoutes
);


/*
|--------------------------------------------------------------------------
| Password Protected Short URL
|--------------------------------------------------------------------------
*/

app.post(
  '/api/unlock/:shortCode',
  unlockShortUrl
);


/*
|--------------------------------------------------------------------------
| Short URL Redirect
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This route comes AFTER all /api routes.
|
*/

app.get(
  '/:shortCode',
  redirectRateLimiter,
  redirectShortUrl
);


/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use(
  notFoundMiddleware
);


/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(
  errorMiddleware
);

export default app;