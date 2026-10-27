
import { validationResult } from "express-validator";

import { generateQrCodeDataUrl } from "../services/qrService.js";

import {
  createShortUrl,
  getUserUrls,
  getUserUrlById,
  findUrlForRedirect,
  verifyUrlPassword,
  updateUrl,
  deleteUrl,
} from "../services/urlService.js";

import { recordClick } from "../services/analyticsService.js";


const buildShortUrl = (shortCode) => {
  return `${process.env.BASE_URL}/${shortCode}`;
};


/*
|--------------------------------------------------------------------------
| CREATE SHORT URL
|--------------------------------------------------------------------------
*/
export const createUrl = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      originalUrl,
      customAlias,
      password,
      expiresAt,
    } = req.body;

    if (expiresAt && new Date(expiresAt) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expiration date must be in the future",
      });
    }

    const url = await createShortUrl({
      userId: req.user.userId,
      originalUrl,
      customAlias,
      password,
      expiresAt,
    });

    res.status(201).json({
      success: true,
      message: "Short URL created successfully",
      data: {
        id: url.id,
        originalUrl: url.original_url,
        shortCode: url.short_code,
        shortUrl: buildShortUrl(url.short_code),
        customAlias: url.custom_alias,
        expiresAt: url.expires_at,
        hasPassword: Boolean(url.password_hash),
        isActive: url.is_active,
        createdAt: url.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| GET USER URLS
|--------------------------------------------------------------------------
*/
export const getUrls = async (req, res, next) => {
  try {
    const page = Math.max(
      parseInt(req.query.page || "1", 10),
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit || "10", 10),
        1
      ),
      50
    );

    const data = await getUserUrls({
      userId: req.user.userId,
      page,
      limit,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| GET SINGLE URL
|--------------------------------------------------------------------------
*/
export const getUrl = async (req, res, next) => {
  try {
    const url = await getUserUrlById(
      req.params.id,
      req.user.userId
    );

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...url,
        short_url: buildShortUrl(url.short_code),
        has_password: Boolean(url.password_hash),
      },
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE URL
|--------------------------------------------------------------------------
*/
export const updateUrlController = async (req, res, next) => {
  try {
    const {
      originalUrl,
      expiresAt,
      password,
      isActive,
    } = req.body;

    if (expiresAt && new Date(expiresAt) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expiration date must be in the future",
      });
    }

    const url = await updateUrl({
      urlId: req.params.id,
      userId: req.user.userId,
      originalUrl,
      expiresAt,
      password,
      isActive,
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    res.json({
      success: true,
      message: "URL updated successfully",
      data: {
        ...url,
        shortUrl: buildShortUrl(url.short_code),
        hasPassword: Boolean(url.password_hash),
      },
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| DELETE URL
|--------------------------------------------------------------------------
*/
export const deleteUrlController = async (req, res, next) => {
  try {
    const url = await deleteUrl(
      req.params.id,
      req.user.userId
    );

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    res.json({
      success: true,
      message: "URL deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| REDIRECT SHORT URL
|--------------------------------------------------------------------------
*/
export const redirectShortUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await findUrlForRedirect(shortCode);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found",
      });
    }

    if (!url.is_active) {
      return res.status(410).json({
        success: false,
        message: "This short URL has been disabled",
      });
    }

    if (
      url.expires_at &&
      new Date(url.expires_at) <= new Date()
    ) {
      return res.status(410).json({
        success: false,
        message: "This short URL has expired",
      });
    }

    /*
     * Password protected URLs must be unlocked first.
     */
    if (url.password_hash) {
      return res.status(401).json({
        success: false,
        passwordRequired: true,
        message: "This short URL is password protected",
        shortCode,
      });
    }

    /*
     * Record analytics.
     *
     * IMPORTANT:
     * Database uses ip_hash, not ip_address.
     */
    recordClick({
      urlId: url.id,
      ipHash: req.ip
        ? req.ip
        : req.headers["x-forwarded-for"] || null,
      userAgent: req.get("user-agent"),
      browser: null,
      operatingSystem: null,
      deviceType: null,
      referrer: req.get("referer"),
      country: null,
    }).catch((error) => {
      console.error(
        "Analytics recording failed:",
        error.message
      );
    });

    return res.redirect(302, url.original_url);
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| UNLOCK PASSWORD-PROTECTED URL
|--------------------------------------------------------------------------
*/
export const unlockShortUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const url = await findUrlForRedirect(shortCode);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found",
      });
    }

    if (!url.is_active) {
      return res.status(410).json({
        success: false,
        message: "This short URL has been disabled",
      });
    }

    if (
      url.expires_at &&
      new Date(url.expires_at) <= new Date()
    ) {
      return res.status(410).json({
        success: false,
        message: "This short URL has expired",
      });
    }

    const valid = await verifyUrlPassword(
      password,
      url.password_hash
    );

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    /*
     * Record analytics after successful password verification.
     */
    recordClick({
      urlId: url.id,
      ipHash: req.ip
        ? req.ip
        : req.headers["x-forwarded-for"] || null,
      userAgent: req.get("user-agent"),
      browser: null,
      operatingSystem: null,
      deviceType: null,
      referrer: req.get("referer"),
      country: null,
    }).catch((error) => {
      console.error(
        "Analytics recording failed:",
        error.message
      );
    });

    res.json({
      success: true,
      data: {
        originalUrl: url.original_url,
      },
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| GENERATE QR CODE
|--------------------------------------------------------------------------
| GET /api/urls/:id/qr
|--------------------------------------------------------------------------
*/
export const generateQrCode = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;

    console.log("========================================");
    console.log("🔳 QR CODE REQUEST");
    console.log("URL ID:", req.params.id);
    console.log("USER ID:", userId);
    console.log("========================================");

    const url = await getUserUrlById(
      req.params.id,
      userId
    );

    if (!url) {
      console.log("❌ URL not found");

      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    const shortUrl = buildShortUrl(
      url.short_code
    );

    console.log("Short URL:", shortUrl);

    const qrCode = await generateQrCodeDataUrl(
      shortUrl
    );

    console.log("✅ QR CODE GENERATED");

    return res.json({
      success: true,
      data: {
        shortUrl,
        qrCode,
      },
    });
  } catch (error) {
    console.error(
      "❌ QR GENERATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to generate QR code",
      error: error.message,
    });
  }
};
