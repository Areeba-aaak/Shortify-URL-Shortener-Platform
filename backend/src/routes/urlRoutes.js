
import express from "express";

import {
  createUrl,
  getUrls,
  getUrl,
  updateUrlController,
  deleteUrlController,
  generateQrCode,
} from "../controllers/urlController.js";

import { authenticate } from "../middleware/authMiddleware.js";

import {
  urlCreationRateLimiter,
} from "../middleware/rateLimiter.js";

import {
  createUrlValidator,
  idValidator,
} from "../validators/urlValidator.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| All URL management routes require authentication
|--------------------------------------------------------------------------
*/
router.use(authenticate);

/*
|--------------------------------------------------------------------------
| Create Short URL
|--------------------------------------------------------------------------
| POST /api/urls
|--------------------------------------------------------------------------
*/
router.post(
  "/",
  urlCreationRateLimiter,
  createUrlValidator,
  createUrl
);

/*
|--------------------------------------------------------------------------
| Get Logged-in User's URLs
|--------------------------------------------------------------------------
| GET /api/urls
|--------------------------------------------------------------------------
*/
router.get(
  "/",
  getUrls
);

/*
|--------------------------------------------------------------------------
| Get Single URL
|--------------------------------------------------------------------------
| GET /api/urls/:id
|--------------------------------------------------------------------------
*/
router.get(
  "/:id",
  idValidator,
  getUrl
);

/*
|--------------------------------------------------------------------------
| Generate QR Code
|--------------------------------------------------------------------------
| GET /api/urls/:id/qr
|--------------------------------------------------------------------------
*/
router.get(
  "/:id/qr",
  idValidator,
  generateQrCode
);

/*
|--------------------------------------------------------------------------
| Update URL
|--------------------------------------------------------------------------
| PUT /api/urls/:id
|--------------------------------------------------------------------------
*/
router.put(
  "/:id",
  idValidator,
  updateUrlController
);

/*
|--------------------------------------------------------------------------
| Delete URL
|--------------------------------------------------------------------------
| DELETE /api/urls/:id
|--------------------------------------------------------------------------
*/
router.delete(
  "/:id",
  idValidator,
  deleteUrlController
);

export default router;
