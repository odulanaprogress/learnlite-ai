import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  aiServiceUrl: process.env.AI_SERVICE_URL || "https://learnlite-ai-service.onrender.com",
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqTextModel: process.env.GROQ_TEXT_MODEL || "llama-3.3-70b-versatile",
  groqVisionModel: process.env.GROQ_VISION_MODEL || "llama-3.2-11b-vision-preview",
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || "25", 10),
  jwtSecret: process.env.JWT_SECRET || "learnlite-dev-secret-key-change-in-production-2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  dataDir: process.env.DATA_DIR || "./data",
};
