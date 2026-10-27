import { validationResult } from 'express-validator';

import { query } from '../config/db.js';

import {
  hashPassword,
  comparePassword,
  hashValue,
  generateRandomToken,
} from '../utils/hash.js';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '../utils/jwt.js';

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      name,
      email,
      password,
    } = req.body;

    const existingUser = await query(
      `
        SELECT id
        FROM users
        WHERE email = $1
      `,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    const passwordHash =
      await hashPassword(password);

    const result = await query(
      `
        INSERT INTO users (
          name,
          email,
          password_hash
        )
        VALUES ($1, $2, $3)
        RETURNING
          id,
          name,
          email,
          role,
          is_active,
          created_at
      `,
      [
        name,
        email,
        passwordHash,
      ]
    );

    const user = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      email,
      password,
    } = req.body;

    const result = await query(
      `
        SELECT *
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been disabled',
      });
    }

    const passwordValid =
      await comparePassword(
        password,
        user.password_hash
      );

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const accessToken =
      generateAccessToken(user);

    const refreshToken =
      generateRefreshToken(user);

    const refreshTokenHash =
      hashValue(refreshToken);

    await query(
      `
        INSERT INTO refresh_tokens (
          user_id,
          token_hash,
          expires_at
        )
        VALUES (
          $1,
          $2,
          NOW() + INTERVAL '7 days'
        )
      `,
      [
        user.id,
        refreshTokenHash,
      ]
    );

    res.cookie(
      'refreshToken',
      refreshToken,
      refreshCookieOptions
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req,
  res,
  next
) => {
  try {
    const refreshToken =
      req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token missing',
      });
    }

    const decoded =
      verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const tokenHash =
      hashValue(refreshToken);

    const result = await query(
      `
        SELECT
          rt.id,
          u.id,
          u.name,
          u.email,
          u.role,
          u.is_active
        FROM refresh_tokens rt
        JOIN users u
          ON u.id = rt.user_id
        WHERE
          rt.token_hash = $1
          AND rt.expires_at > NOW()
        LIMIT 1
      `,
      [tokenHash]
    );

    const user = result.rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is invalid or expired',
      });
    }

    const accessToken =
      generateAccessToken(user);

    res.json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
};

export const logout = async (
  req,
  res,
  next
) => {
  try {
    const refreshToken =
      req.cookies.refreshToken;

    if (refreshToken) {
      const tokenHash =
        hashValue(refreshToken);

      await query(
        `
          DELETE FROM refresh_tokens
          WHERE token_hash = $1
        `,
        [tokenHash]
      );
    }

    res.clearCookie(
      'refreshToken',
      refreshCookieOptions
    );

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
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
        WHERE id = $1
      `,
      [req.user.userId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};