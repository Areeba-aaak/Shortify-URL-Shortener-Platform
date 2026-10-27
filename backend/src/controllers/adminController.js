import { query } from '../config/db.js';

import {
  getAllUrlsForAdmin,
  setUrlStatus,
} from '../services/urlService.js';

export const getDashboard = async (
  req,
  res,
  next
) => {
  try {
    const [
      usersResult,
      urlsResult,
      clicksResult,
      activeUrlsResult,
      expiredUrlsResult,
    ] = await Promise.all([
      query(
        `
          SELECT COUNT(*)::int AS total
          FROM users
        `
      ),

      query(
        `
          SELECT COUNT(*)::int AS total
          FROM urls
        `
      ),

      query(
        `
          SELECT COUNT(*)::int AS total
          FROM clicks
        `
      ),

      query(
        `
          SELECT COUNT(*)::int AS total
          FROM urls
          WHERE is_active = TRUE
        `
      ),

      query(
        `
          SELECT COUNT(*)::int AS total
          FROM urls
          WHERE
            expires_at IS NOT NULL
            AND expires_at <= NOW()
        `
      ),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers:
          usersResult.rows[0].total,

        totalUrls:
          urlsResult.rows[0].total,

        totalClicks:
          clicksResult.rows[0].total,

        activeUrls:
          activeUrlsResult.rows[0].total,

        expiredUrls:
          expiredUrlsResult.rows[0].total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req,
  res,
  next
) => {
  try {
    const result = await query(
      `
        SELECT
          id,
          name,
          email,
          role,
          is_active,
          created_at
        FROM users
        ORDER BY created_at DESC
      `
    );

    res.json({
      success: true,
      data: {
        users: result.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUrls = async (
  req,
  res,
  next
) => {
  try {
    const page = Math.max(
      parseInt(req.query.page || '1', 10),
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit || '20', 10),
        1
      ),
      100
    );

    const urls =
      await getAllUrlsForAdmin({
        page,
        limit,
      });

    res.json({
      success: true,
      data: {
        urls,
        page,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUrlStatus = async (
  req,
  res,
  next
) => {
  try {
    const {
      isActive,
    } = req.body;

    if (
      typeof isActive !== 'boolean'
    ) {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean',
      });
    }

    const url = await setUrlStatus(
      req.params.id,
      isActive
    );

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found',
      });
    }

    res.json({
      success: true,
      message: `URL ${
        isActive
          ? 'enabled'
          : 'disabled'
      } successfully`,
      data: {
        id: url.id,
        isActive: url.is_active,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUrl = async (
  req,
  res,
  next
) => {
  try {
    const result = await query(
      `
        DELETE FROM urls
        WHERE id = $1
        RETURNING id, short_code
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'URL not found',
      });
    }

    res.json({
      success: true,
      message: 'URL deleted by admin',
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemAnalytics = async (
  req,
  res,
  next
) => {
  try {
    const [
      clicksByDay,
      topUrls,
      browsers,
      devices,
    ] = await Promise.all([
      query(
        `
          SELECT
            DATE(clicked_at) AS date,
            COUNT(*)::int AS clicks
          FROM clicks
          WHERE clicked_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(clicked_at)
          ORDER BY date ASC
        `
      ),

      query(
        `
          SELECT
            u.id,
            u.short_code,
            u.original_url,
            COUNT(c.id)::int AS clicks
          FROM urls u
          LEFT JOIN clicks c
            ON c.url_id = u.id
          GROUP BY u.id
          ORDER BY clicks DESC
          LIMIT 10
        `
      ),

      query(
        `
          SELECT
            browser,
            COUNT(*)::int AS clicks
          FROM clicks
          GROUP BY browser
          ORDER BY clicks DESC
        `
      ),

      query(
        `
          SELECT
            device_type,
            COUNT(*)::int AS clicks
          FROM clicks
          GROUP BY device_type
          ORDER BY clicks DESC
        `
      ),
    ]);

    res.json({
      success: true,
      data: {
        clicksByDay:
          clicksByDay.rows,

        topUrls:
          topUrls.rows,

        browsers:
          browsers.rows,

        devices:
          devices.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};