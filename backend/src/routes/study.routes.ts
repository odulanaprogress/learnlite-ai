import { Router, Request, Response } from "express";
import { aiServiceClient } from "../services/aiService.js";
import { storageService } from "../services/storageService.js";
import { optionalAuth } from "../middleware/auth.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { StudyPackRequest } from "../types/index.js";

const router = Router();

// POST /api/v1/study/generate
router.post("/generate", optionalAuth, async (req: Request, res: Response) => {
  try {
    const studyReq: StudyPackRequest = req.body;

    if (!studyReq.pages || !Array.isArray(studyReq.pages) || studyReq.pages.length === 0) {
      sendError(res, "At least one page of extracted text is required to generate a study pack.", 400, "MISSING_PAGES");
      return;
    }

    if (studyReq.flashcard_count !== undefined) {
      studyReq.flashcard_count = Math.max(5, studyReq.flashcard_count);
    } else {
      studyReq.flashcard_count = 8;
    }

    if (studyReq.quiz_count !== undefined) {
      studyReq.quiz_count = Math.max(3, studyReq.quiz_count);
    } else {
      studyReq.quiz_count = 5;
    }

    const generated = await aiServiceClient.generateStudyPack(studyReq);
    const userId = req.user?.id || studyReq.userId;
    const saved = storageService.saveStudyPack({ ...generated, userId });

    sendSuccess(
      res,
      "Study pack generated and academically grounded successfully!",
      saved,
      201
    );
  } catch (err: any) {
    sendError(res, err.message || "Failed to generate study pack from AI service.", 502, "AI_GENERATION_FAILED");
  }
});

// GET /api/v1/study/packs
router.get("/packs", optionalAuth, (req: Request, res: Response) => {
  const packs = storageService.getAllStudyPacks(req.user?.id);
  sendSuccess(
    res,
    `Loaded ${packs.length} study pack(s).`,
    packs,
    200,
    { total: packs.length }
  );
});

// GET /api/v1/study/packs/:id
router.get("/packs/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const pack = storageService.getStudyPack(id);

  if (!pack) {
    sendError(res, `Study pack with id '${id}' was not found.`, 404, "STUDY_PACK_NOT_FOUND");
    return;
  }

  sendSuccess(res, "Study pack loaded successfully.", pack, 200);
});

export default router;
