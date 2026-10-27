
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6380",
});

redisClient.on("error", (error) => {
  console.error("❌ Redis Client Error:", error.message);
});

redisClient.on("connect", () => {
  console.log("🔄 Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("✅ Redis ready");
});

redisClient.on("end", () => {
  console.log("🔴 Redis connection closed");
});

// Connect Redis immediately when this module is loaded.
// This is important because rateLimiter.js needs
// Redis to already be connected.
if (!redisClient.isOpen) {
  await redisClient.connect();

  console.log("✅ Redis connected successfully");
}

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("✅ Redis connected successfully");
    }

    return redisClient;
  } catch (error) {
    console.error("❌ Redis connection failed:", error.message);
    throw error;
  }
};

export default redisClient;
