import { Router, Request, Response } from "express";
import { storageService } from "../services/storageService.js";
import { optionalAuth } from "../middleware/auth.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { OfflineSyncRequest, OfflineSyncResponse } from "../types/index.js";

const router = Router();

// POST /api/v1/sync
// Batch endpoint for reconciling offline quiz attempts and completed resources
router.post("/", optionalAuth, (req: Request, res: Response) => {
  try {
    const payload: OfflineSyncRequest = req.body;
    const syncKey = req.user?.id || payload.userId || payload.clientId;

    if (!syncKey) {
      sendError(
        res,
        "A clientId or active student session is required for offline sync.",
        400,
        "MISSING_CLIENT_ID"
      );
      return;
    }

    const quizAttempts = (payload.quizAttempts || []).map((attempt) => ({
      ...attempt,
      userId: req.user?.id || attempt.userId,
    }));

    const recordedCount = storageService.recordQuizAttempts(syncKey, quizAttempts);

    const response: OfflineSyncResponse = {
      success: true,
      syncedAttemptsCount: recordedCount,
      syncedPacksCount: (payload.completedPacks || []).length,
      serverTimestamp: Date.now(),
    };

    sendSuccess(
      res,
      `Offline sync complete! ${recordedCount} quiz attempt(s) and ${(payload.completedPacks || []).length} study pack(s) synced.`,
      response,
      200
    );
  } catch (err: any) {
    sendError(res, err.message || "Failed to reconcile offline sync.", 500, "SYNC_FAILED");
  }
});

// GET /api/v1/sync/:clientId
router.get("/:clientId", optionalAuth, (req: Request, res: Response) => {
  const clientId = req.params.clientId as string;
  const syncKey = req.user?.id || clientId;
  const attempts = storageService.getQuizAttempts(syncKey);

  sendSuccess(
    res,
    `Retrieved ${attempts.length} recorded quiz attempt(s).`,
    {
      clientId: syncKey,
      totalAttempts: attempts.length,
      attempts,
    },
    200
  );
});

export default router;
