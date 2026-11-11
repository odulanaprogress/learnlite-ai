import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqTextModel: process.env.GROQ_TEXT_MODEL || "openai/gpt-oss-20b",
  groqVisionModel: process.env.GROQ_VISION_MODEL || "qwen/qwen3.8-27b",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || "15", 10),
  jwtSecret: process.env.JWT_SECRET || "learnlite-dev-secret-key-change-in-production-2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  dataDir: process.env.DATA_DIR || "./data",
};
