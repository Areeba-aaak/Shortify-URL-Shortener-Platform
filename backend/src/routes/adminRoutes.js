import express from 'express';

import {
  authenticate,
} from '../middleware/authMiddleware.js';

import {
  requireAdmin,
} from '../middleware/adminMiddleware.js';

import {
  getDashboard,
  getUsers,
  getUrls,
  updateUrlStatus,
  deleteUrl,
  getSystemAnalytics,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(
  authenticate,
  requireAdmin
);

router.get(
  '/dashboard',
  getDashboard
);

router.get(
  '/users',
  getUsers
);

router.get(
  '/urls',
  getUrls
);

router.get(
  '/analytics',
  getSystemAnalytics
);

router.patch(
  '/urls/:id/status',
  updateUrlStatus
);

router.delete(
  '/urls/:id',
  deleteUrl
);

export default router;