
import { query } from "../config/db.js";
import {
  getUrlAnalytics,
  getUserAnalytics,
} from "../services/analyticsService.js";
import { getUserUrlById } from "../services/urlService.js";
import { validationResult } from "express-validator";


/*
|--------------------------------------------------------------------------
| Dashboard Analytics
|--------------------------------------------------------------------------
| GET /api/analytics/dashboard
*/
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;

    const analytics = await getUserAnalytics(userId);

    return res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| Single URL Analytics
|--------------------------------------------------------------------------
| GET /api/analytics/:id
*/
export const getAnalytics = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const urlId = req.params.id;
    const userId = req.user.userId || req.user.id;

    const analytics = await getUrlAnalytics(urlId, userId);

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    return res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| Click Details
|--------------------------------------------------------------------------
| GET /api/analytics/:id/clicks
*/
export const getClicks = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const urlId = req.params.id;
    const userId = req.user.userId || req.user.id;

    /*
     * Make sure this URL belongs to the logged-in user.
     */
    const urlResult = await getUserUrlById(urlId, userId);

    if (!urlResult) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 50, 1),
      100
    );

    const offset = (page - 1) * limit;

    const clicksResult = await query(
      `
        SELECT
          id,
          ip_hash,
          user_agent,
          browser,
          operating_system,
          device_type,
          referrer,
          country,
          clicked_at
        FROM clicks
        WHERE url_id = $1
        ORDER BY clicked_at DESC
        LIMIT $2
        OFFSET $3
      `,
      [urlId, limit, offset]
    );

    const countResult = await query(
      `
        SELECT COUNT(*)::int AS total
        FROM clicks
        WHERE url_id = $1
      `,
      [urlId]
    );

    const total = countResult.rows[0].total;

    return res.json({
      success: true,
      data: {
        clicks: clicksResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
