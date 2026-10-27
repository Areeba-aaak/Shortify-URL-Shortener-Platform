import redisClient from '../config/redis.js';

const DEFAULT_TTL = 60 * 60;

export const setUrlCache = async (
  shortCode,
  urlData,
  ttl = DEFAULT_TTL
) => {
  if (!redisClient.isReady) {
    return;
  }

  const key = `url:${shortCode}`;

  await redisClient.set(
    key,
    JSON.stringify(urlData),
    {
      EX: ttl,
    }
  );
};

export const getUrlCache = async (shortCode) => {
  if (!redisClient.isReady) {
    return null;
  }

  const key = `url:${shortCode}`;

  const cached = await redisClient.get(key);

  if (!cached) {
    return null;
  }

  return JSON.parse(cached);
};

export const deleteUrlCache = async (shortCode) => {
  if (!redisClient.isReady) {
    return;
  }

  await redisClient.del(`url:${shortCode}`);
};

export const cacheExists = async (shortCode) => {
  if (!redisClient.isReady) {
    return false;
  }

  return redisClient.exists(`url:${shortCode}`);
};