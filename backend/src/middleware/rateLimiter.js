
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis.js";

/*
|--------------------------------------------------------------------------
| Redis Store
|--------------------------------------------------------------------------
*/

const createRedisStore = () => {
  return new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  });
};

/*
|--------------------------------------------------------------------------
| General API Rate Limiter
|--------------------------------------------------------------------------
|
| Protects the general API.
| 100 requests / 15 minutes / IP
|
*/

export const generalRateLimiter = rateLimit({
  store: createRedisStore(),
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,

  // Do not count successful requests against the limit.
  skipSuccessfulRequests: true,

  message: {
    message: "Too many requests. Please try again later.",
  },
});

/*
|--------------------------------------------------------------------------
| Authentication Rate Limiter
|--------------------------------------------------------------------------
|
| Protects login/register endpoints.
| 20 requests / 15 minutes / IP
|
*/

export const authRateLimiter = rateLimit({
  store: createRedisStore(),

  windowMs: 15 * 60 * 1000,

  limit: 20,

  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    message:
      "Too many authentication attempts. Please try again later.",
  },
});

/*
|--------------------------------------------------------------------------
| URL Creation Rate Limiter
|--------------------------------------------------------------------------
|
| Protects POST /api/urls.
|
| 30 URL creation attempts / 15 minutes / IP
|
| Successful URL creations are not counted.
|
*/

export const urlCreationRateLimiter = rateLimit({
  store: createRedisStore(),

  windowMs: 15 * 60 * 1000,

  limit: 30,

  standardHeaders: "draft-7",
  legacyHeaders: false,

  // Only count failed URL creation attempts.
  skipSuccessfulRequests: true,

  message: {
    message:
      "Too many URL creation attempts. Please try again later.",
  },
});

/*
|--------------------------------------------------------------------------
| Redirect Rate Limiter
|--------------------------------------------------------------------------
|
| Protects:
|
| GET /:shortCode
|
| 60 requests / 1 minute / IP
|
*/

export const redirectRateLimiter = rateLimit({
  store: createRedisStore(),

  windowMs: 60 * 1000,

  limit: 60,

  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    message:
      "Too many redirect requests. Please try again later.",
  },
});
