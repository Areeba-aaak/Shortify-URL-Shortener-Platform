import express from 'express';

import {
  register,
  login,
  refresh,
  logout,
  getMe,
} from '../controllers/authController.js';

import {
  authenticate,
} from '../middleware/authMiddleware.js';

import {
  authRateLimiter,
} from '../middleware/rateLimiter.js';

import {
  registerValidator,
  loginValidator,
} from '../validators/authValidator.js';

const router = express.Router();

router.post(
  '/register',
  authRateLimiter,
  registerValidator,
  register
);

router.post(
  '/login',
  authRateLimiter,
  loginValidator,
  login
);

router.post(
  '/refresh',
  refresh
);

router.post(
  '/logout',
  logout
);

router.get(
  '/me',
  authenticate,
  getMe
);

export default router;