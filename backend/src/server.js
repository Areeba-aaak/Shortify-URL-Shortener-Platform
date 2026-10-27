
import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import { testDatabaseConnection } from "./config/db.js";
import { connectRedis } from "./config/redis.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("🔄 Starting URL Shortener backend...");

    // Test PostgreSQL
    const databaseConnected = await testDatabaseConnection();

    if (!databaseConnected) {
      throw new Error("PostgreSQL connection failed");
    }

    console.log("✅ Database connected");

    // Connect Redis
    await connectRedis();

    console.log("✅ Redis connected");

    // Start Express server
    app.listen(PORT, () => {
      console.log("");
      console.log("========================================");
      console.log(`🚀 URL Shortener API running on port ${PORT}`);
      console.log(`🌐 API: http://localhost:${PORT}`);
      console.log(`❤️ Health: http://localhost:${PORT}/api/health`);
      console.log("========================================");
      console.log("");
    });
  } catch (error) {
    console.error("");
    console.error("❌ Failed to start server");
    console.error("Error:", error.message);
    console.error("");
    process.exit(1);
  }
};

startServer();
