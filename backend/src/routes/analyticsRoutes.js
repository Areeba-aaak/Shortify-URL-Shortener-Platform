
import express from "express";

import {
  authenticate,
} from "../middleware/authMiddleware.js";

import {
  getAnalytics,
  getDashboardAnalytics,
  getClicks,
} from "../controllers/analyticsController.js";

import {
  idValidator,
} from "../validators/urlValidator.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/
router.use(authenticate);

/*
|--------------------------------------------------------------------------
| Dashboard Analytics
|--------------------------------------------------------------------------
| GET /api/analytics/dashboard
|
| IMPORTANT:
| This must come BEFORE /:id.
| Otherwise "dashboard" will be treated as an ID.
|--------------------------------------------------------------------------
*/
router.get(
  "/dashboard",
  getDashboardAnalytics
);

/*
|--------------------------------------------------------------------------
| URL Analytics
|--------------------------------------------------------------------------
| GET /api/analytics/:id
|--------------------------------------------------------------------------
*/
router.get(
  "/:id",
  idValidator,
  getAnalytics
);

/*
|--------------------------------------------------------------------------
| URL Clicks
|--------------------------------------------------------------------------
| GET /api/analytics/:id/clicks
|--------------------------------------------------------------------------
*/
router.get(
  "/:id/clicks",
  idValidator,
  getClicks
);

export default router;
