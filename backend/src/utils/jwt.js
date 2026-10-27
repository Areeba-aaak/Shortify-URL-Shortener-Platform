import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured in .env');
}

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      type: 'refresh',
    },
    JWT_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};