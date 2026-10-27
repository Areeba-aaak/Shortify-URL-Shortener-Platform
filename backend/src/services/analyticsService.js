
import { query } from "../config/db.js";

/*
|--------------------------------------------------------------------------
| Record Click
|--------------------------------------------------------------------------
| Stores information whenever somebody opens a shortened URL.
*/
export const recordClick = async ({
  urlId,
  ipHash,
  userAgent,
  browser,
  operatingSystem,
  deviceType,
  referrer,
  country,
}) => {
  const result = await query(
    `
      INSERT INTO clicks (
        url_id,
        ip_hash,
        user_agent,
        browser,
        operating_system,
        device_type,
        referrer,
        country
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        url_id,
        ip_hash,
        user_agent,
        browser,
        operating_system,
        device_type,
        referrer,
        country,
        clicked_at
    `,
    [
      urlId,
      ipHash || null,
      userAgent || null,
      browser || null,
      operatingSystem || null,
      deviceType || null,
      referrer || null,
      country || null,
    ]
  );

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| Get Overall User Analytics
|--------------------------------------------------------------------------
| Used by the main Analytics dashboard.
*/
export const getUserAnalytics = async (userId) => {
  const totalUrlsResult = await query(
    `
      SELECT COUNT(*)::int AS total_urls
      FROM urls
      WHERE user_id = $1
    `,
    [userId]
  );

  const totalClicksResult = await query(
    `
      SELECT COUNT(*)::int AS total_clicks
      FROM clicks c
      INNER JOIN urls u ON u.id = c.url_id
      WHERE u.user_id = $1
    `,
    [userId]
  );

  const uniqueVisitorsResult = await query(
    `
      SELECT COUNT(DISTINCT c.ip_hash)::int AS unique_visitors
      FROM clicks c
      INNER JOIN urls u ON u.id = c.url_id
      WHERE u.user_id = $1
        AND c.ip_hash IS NOT NULL
    `,
    [userId]
  );

  const dailyResult = await query(
    `
      SELECT
        DATE(c.clicked_at) AS date,
        COUNT(*)::int AS clicks
      FROM clicks c
      INNER JOIN urls u ON u.id = c.url_id
      WHERE u.user_id = $1
      GROUP BY DATE(c.clicked_at)
      ORDER BY DATE(c.clicked_at)
    `,
    [userId]
  );

  return {
    totalUrls: totalUrlsResult.rows[0].total_urls,
    totalClicks: totalClicksResult.rows[0].total_clicks,
    uniqueVisitors: uniqueVisitorsResult.rows[0].unique_visitors,
    daily: dailyResult.rows,
  };
};


/*
|--------------------------------------------------------------------------
| Get Analytics For One URL
|--------------------------------------------------------------------------
*/
export const getUrlAnalytics = async (urlId, userId) => {
  const urlResult = await query(
    `
      SELECT
        id,
        original_url,
        short_code,
        custom_alias,
        expires_at,
        is_active,
        created_at
      FROM urls
      WHERE id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [urlId, userId]
  );

  if (urlResult.rows.length === 0) {
    return null;
  }

  const url = urlResult.rows[0];

  /*
   * Total clicks
   */
  const totalClicksResult = await query(
    `
      SELECT COUNT(*)::int AS total_clicks
      FROM clicks
      WHERE url_id = $1
    `,
    [urlId]
  );

  /*
   * Unique visitors
   */
  const uniqueVisitorsResult = await query(
    `
      SELECT COUNT(DISTINCT ip_hash)::int AS unique_visitors
      FROM clicks
      WHERE url_id = $1
        AND ip_hash IS NOT NULL
    `,
    [urlId]
  );

  /*
   * Daily clicks
   */
  const dailyResult = await query(
    `
      SELECT
        DATE(clicked_at) AS date,
        COUNT(*)::int AS clicks
      FROM clicks
      WHERE url_id = $1
      GROUP BY DATE(clicked_at)
      ORDER BY DATE(clicked_at)
    `,
    [urlId]
  );

  /*
   * Browser statistics
   */
  const browserResult = await query(
    `
      SELECT
        COALESCE(browser, 'Unknown') AS browser,
        COUNT(*)::int AS clicks
      FROM clicks
      WHERE url_id = $1
      GROUP BY browser
      ORDER BY clicks DESC
    `,
    [urlId]
  );

  /*
   * Country statistics
   */
  const countryResult = await query(
    `
      SELECT
        COALESCE(country, 'Unknown') AS country,
        COUNT(*)::int AS clicks
      FROM clicks
      WHERE url_id = $1
      GROUP BY country
      ORDER BY clicks DESC
    `,
    [urlId]
  );

  /*
   * Operating system statistics
   */
  const operatingSystemResult = await query(
    `
      SELECT
        COALESCE(operating_system, 'Unknown') AS operating_system,
        COUNT(*)::int AS clicks
      FROM clicks
      WHERE url_id = $1
      GROUP BY operating_system
      ORDER BY clicks DESC
    `,
    [urlId]
  );

  /*
   * Device statistics
   */
  const deviceResult = await query(
    `
      SELECT
        COALESCE(device_type, 'Unknown') AS device_type,
        COUNT(*)::int AS clicks
      FROM clicks
      WHERE url_id = $1
      GROUP BY device_type
      ORDER BY clicks DESC
    `,
    [urlId]
  );

  return {
    url,

    summary: {
      totalClicks: totalClicksResult.rows[0].total_clicks,
      uniqueVisitors: uniqueVisitorsResult.rows[0].unique_visitors,
    },

    daily: dailyResult.rows,

    browsers: browserResult.rows,

    countries: countryResult.rows,

    operatingSystems: operatingSystemResult.rows,

    devices: deviceResult.rows,
  };
};
