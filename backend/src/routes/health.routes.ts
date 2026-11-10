import { Router, Request, Response } from "express";
import { aiServiceClient } from "../services/aiService.js";
import { sendSuccess } from "../utils/response.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const aiHealth = await aiServiceClient.checkHealth();

  sendSuccess(
    res,
    "LearnLite Backend is healthy and operational.",
    {
      status: "healthy",
      service: "learnlite-backend",
      version: "0.1.0",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      aiService: aiHealth,
    },
    200
  );
});

export default router;
