import { query } from "../config/db.js";

import {
  getUrlCache,
  setUrlCache,
  deleteUrlCache,
} from "./redisService.js";

import { generateShortCode } from "../utils/shortCode.js";

import {
  hashPassword,
  comparePassword,
} from "../utils/hash.js";

/*
|--------------------------------------------------------------------------
| Cache TTL
|--------------------------------------------------------------------------
*/

const getCacheTTL = (expiresAt) => {
  if (!expiresAt) {
    return 60 * 60;
  }

  const remainingSeconds = Math.floor(
    (new Date(expiresAt).getTime() - Date.now()) / 1000
  );

  if (remainingSeconds <= 0) {
    return 1;
  }

  return Math.min(remainingSeconds, 60 * 60 * 24);
};

/*
|--------------------------------------------------------------------------
| CREATE SHORT URL
|--------------------------------------------------------------------------
*/

export const createShortUrl = async ({
  userId,
  originalUrl,
  customAlias,
  password,
  expiresAt,
}) => {
  let shortCode = customAlias || null;

  // Check custom alias
  if (customAlias) {
    const existing = await query(
      `
        SELECT id
        FROM urls
        WHERE custom_alias = $1
      `,
      [customAlias]
    );

    if (existing.rows.length > 0) {
      const error = new Error(
        "Custom alias is already in use"
      );

      error.statusCode = 409;

      throw error;
    }
  }

  // Generate unique short code
  if (!shortCode) {
    let isUnique = false;

    while (!isUnique) {
      shortCode = generateShortCode(7);

      const existing = await query(
        `
          SELECT id
          FROM urls
          WHERE short_code = $1
        `,
        [shortCode]
      );

      isUnique = existing.rows.length === 0;
    }
  }

  // Hash password if provided
  let passwordHash = null;

  if (password) {
    passwordHash = await hashPassword(password);
  }

  // Insert URL
  const result = await query(
    `
      INSERT INTO urls (
        user_id,
        original_url,
        short_code,
        custom_alias,
        password_hash,
        expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [
      userId,
      originalUrl,
      shortCode,
      customAlias || null,
      passwordHash,
      expiresAt || null,
    ]
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET USER URLS
|--------------------------------------------------------------------------
*/

export const getUserUrls = async ({
  userId,
  page = 1,
  limit = 10,
}) => {
  const offset = (page - 1) * limit;

  const result = await query(
    `
      SELECT
        u.id,
        u.original_url,
        u.short_code,
        u.custom_alias,
        u.expires_at,
        u.is_active,
        u.created_at,
        u.updated_at,
        COUNT(c.id)::int AS total_clicks
      FROM urls u
      LEFT JOIN clicks c
        ON c.url_id = u.id
      WHERE u.user_id = $1
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT $2
      OFFSET $3
    `,
    [userId, limit, offset]
  );

  const countResult = await query(
    `
      SELECT COUNT(*)::int AS total
      FROM urls
      WHERE user_id = $1
    `,
    [userId]
  );

  const total = countResult.rows[0].total;

  return {
    urls: result.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/*
|--------------------------------------------------------------------------
| GET URL BY ID
|--------------------------------------------------------------------------
*/

export const getUrlById = async (urlId) => {
  const result = await query(
    `
      SELECT
        u.*,
        COUNT(c.id)::int AS total_clicks
      FROM urls u
      LEFT JOIN clicks c
        ON c.url_id = u.id
      WHERE u.id = $1
      GROUP BY u.id
    `,
    [urlId]
  );

  return result.rows[0] || null;
};

/*
|--------------------------------------------------------------------------
| GET USER'S URL BY ID
|--------------------------------------------------------------------------
*/

export const getUserUrlById = async (urlId, userId) => {
  const result = await query(
    `
      SELECT
        u.*,
        COUNT(c.id)::int AS total_clicks
      FROM urls u
      LEFT JOIN clicks c
        ON c.url_id = u.id
      WHERE u.id = $1
        AND u.user_id = $2
      GROUP BY u.id
    `,
    [urlId, userId]
  );

  return result.rows[0] || null;
};

/*
|--------------------------------------------------------------------------
| FIND URL FOR REDIRECT
|--------------------------------------------------------------------------
*/

export const findUrlForRedirect = async (shortCode) => {
  // First check Redis
  const cached = await getUrlCache(shortCode);

  if (cached) {
    return {
      ...cached,
      cacheHit: true,
    };
  }

  // If not in Redis, get from PostgreSQL
  const result = await query(
    `
      SELECT
        id,
        user_id,
        original_url,
        short_code,
        password_hash,
        expires_at,
        is_active
      FROM urls
      WHERE short_code = $1
      LIMIT 1
    `,
    [shortCode]
  );

  const url = result.rows[0];

  if (!url) {
    return null;
  }

  const cacheData = {
    id: url.id,
    user_id: url.user_id,
    original_url: url.original_url,
    short_code: url.short_code,
    password_hash: url.password_hash,
    expires_at: url.expires_at,
    is_active: url.is_active,
  };

  const ttl = getCacheTTL(url.expires_at);

  await setUrlCache(
    shortCode,
    cacheData,
    ttl
  );

  return {
    ...cacheData,
    cacheHit: false,
  };
};

/*
|--------------------------------------------------------------------------
| VERIFY URL PASSWORD
|--------------------------------------------------------------------------
*/

export const verifyUrlPassword = async (
  password,
  passwordHash
) => {
  if (!passwordHash) {
    return true;
  }

  return comparePassword(
    password,
    passwordHash
  );
};

/*
|--------------------------------------------------------------------------
| UPDATE URL
|--------------------------------------------------------------------------
*/

export const updateUrl = async ({
  urlId,
  userId,
  originalUrl,
  expiresAt,
  password,
  isActive,
}) => {
  const existing = await getUserUrlById(
    urlId,
    userId
  );

  if (!existing) {
    return null;
  }

  let passwordHash = existing.password_hash;

  // Password was included in update request
  if (password !== undefined) {
    if (password === null || password === "") {
      passwordHash = null;
    } else {
      passwordHash = await hashPassword(password);
    }
  }

  const result = await query(
    `
      UPDATE urls
      SET
        original_url = COALESCE($1, original_url),
        expires_at = $2,
        password_hash = $3,
        is_active = COALESCE($4, is_active),
        updated_at = NOW()
      WHERE id = $5
        AND user_id = $6
      RETURNING *
    `,
    [
      originalUrl || null,
      expiresAt || null,
      passwordHash,
      isActive,
      urlId,
      userId,
    ]
  );

  // Remove old cached version
  await deleteUrlCache(
    existing.short_code
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| DELETE URL
|--------------------------------------------------------------------------
*/

export const deleteUrl = async (
  urlId,
  userId
) => {
  const existing = await getUserUrlById(
    urlId,
    userId
  );

  if (!existing) {
    return null;
  }

  await query(
    `
      DELETE FROM urls
      WHERE id = $1
        AND user_id = $2
    `,
    [urlId, userId]
  );

  // Remove from Redis
  await deleteUrlCache(
    existing.short_code
  );

  return existing;
};

/*
|--------------------------------------------------------------------------
| ADMIN - GET ALL URLS
|--------------------------------------------------------------------------
*/

export const getAllUrlsForAdmin = async ({
  page = 1,
  limit = 20,
}) => {
  const offset = (page - 1) * limit;

  const result = await query(
    `
      SELECT
        u.id,
        u.original_url,
        u.short_code,
        u.custom_alias,
        u.expires_at,
        u.is_active,
        u.created_at,
        users.name AS owner_name,
        users.email AS owner_email,
        COUNT(c.id)::int AS total_clicks
      FROM urls u
      JOIN users
        ON users.id = u.user_id
      LEFT JOIN clicks c
        ON c.url_id = u.id
      GROUP BY
        u.id,
        users.name,
        users.email
      ORDER BY u.created_at DESC
      LIMIT $1
      OFFSET $2
    `,
    [limit, offset]
  );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| ADMIN - ENABLE / DISABLE URL
|--------------------------------------------------------------------------
*/

export const setUrlStatus = async (
  urlId,
  isActive
) => {
  const result = await query(
    `
      UPDATE urls
      SET
        is_active = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `,
    [isActive, urlId]
  );

  const url = result.rows[0];

  if (url) {
    await deleteUrlCache(
      url.short_code
    );
  }

  return url || null;
};