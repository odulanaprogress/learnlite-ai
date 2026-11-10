import { Router, Request, Response } from "express";
import { sseManager } from "../realtime/sse.js";
import { sendError } from "../utils/response.js";

const router = Router();

// GET /api/v1/events/:sessionId
// Establishes persistent SSE connection for real-time progress updates
router.get("/:sessionId", (req: Request, res: Response) => {
  const sessionId = req.params.sessionId as string;
  if (!sessionId || !sessionId.trim()) {
    sendError(res, "sessionId query parameter is required to establish real-time SSE stream.", 400, "MISSING_SESSION_ID");
    return;
  }

  sseManager.setupConnection(sessionId.trim(), res);
});

export default router;
