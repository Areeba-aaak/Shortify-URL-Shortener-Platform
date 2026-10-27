import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 12;

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};

export const hashValue = (value) => {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
};

export const generateRandomToken = (bytes = 48) => {
  return crypto.randomBytes(bytes).toString('hex');
};