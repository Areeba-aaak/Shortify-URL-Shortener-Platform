import { verifyToken } from '../utils/jwt.js';

export const authenticate = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const token = authorization.split(' ')[1];

    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
};