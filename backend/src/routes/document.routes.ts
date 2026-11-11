import { Router, Request, Response } from "express";
import multer from "multer";
import { config } from "../config/index.js";
import { aiServiceClient } from "../services/aiService.js";
import { storageService } from "../services/storageService.js";
import { sseManager } from "../realtime/sse.js";
import { optionalAuth } from "../middleware/auth.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { ExtractedPage, StudyDifficulty } from "../types/index.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024,
  },
});

const router = Router();

// 1. Standalone document extraction
router.post(
  "/extract",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        sendError(res, "Please select an academic document or photograph of notes to upload.", 400, "NO_FILE_UPLOADED");
        return;
      }

      const file = req.file;
      const extraction = await aiServiceClient.extractDocument(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      sendSuccess(
        res,
        `Document extracted successfully (${extraction.extracted_pages} page(s), ${extraction.total_characters} characters).`,
        extraction,
        200
      );
    } catch (err: any) {
      sendError(
        res,
        err.message || "Failed to extract text from the uploaded document.",
        502,
        "EXTRACTION_FAILED"
      );
    }
  }
);

// 2. Text ingestion directly (from typing or pasting notes)
router.post("/extract-text", async (req: Request, res: Response) => {
  try {
    const { text, filename = "typed-notes" } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      sendError(res, "Please enter or paste lecture notes text to analyze.", 400, "EMPTY_TEXT");
      return;
    }

    const trimmed = text.trim();
    const pages: ExtractedPage[] = [
      {
        page_number: 1,
        text: trimmed,
      },
    ];

    sendSuccess(
      res,
      `Lecture notes received and parsed successfully (${trimmed.length} characters).`,
      {
        filename,
        total_pages: 1,
        extracted_pages: 1,
        total_characters: trimmed.length,
        extraction_status: "success",
        pages,
      },
      200
    );
  } catch (err: any) {
    sendError(res, err.message || "Failed to process text notes.", 500, "TEXT_PROCESSING_FAILED");
  }
});

// 3. End-to-end Process & Generate with Real-Time SSE Progress
router.post(
  "/process-and-generate",
  optionalAuth,
  upload.single("file"),
  async (req: Request, res: Response) => {
    const sessionId = (req.headers["x-session-id"] as string) || (req.body.sessionId as string);
    const difficulty = (req.body.difficulty || "intermediate") as StudyDifficulty;
    const flashcardCount = Math.max(5, parseInt(req.body.flashcardCount || "8", 10));
    const quizCount = Math.max(3, parseInt(req.body.quizCount || "5", 10));

    const emitProgress = (stage: string, progress: number, message: string) => {
      if (sessionId) {
        sseManager.sendEvent(sessionId, "pipeline:progress", {
          stage,
          progress,
          message,
          timestamp: Date.now(),
        });
      }
    };

    try {
      let pages: ExtractedPage[] = [];
      let filename = "notes";

      if (req.file) {
        filename = req.file.originalname;
        emitProgress("upload", 20, `Uploading '${filename}' and extracting text...`);

        const extraction = await aiServiceClient.extractDocument(
          req.file.buffer,
          filename,
          req.file.mimetype
        );

        pages = extraction.pages.filter((p) => p.text.trim().length > 0);
        emitProgress(
          "extracted",
          50,
          `Extracted ${extraction.total_characters} characters from ${extraction.extracted_pages} page(s).`
        );
      } else if (req.body.text && typeof req.body.text === "string") {
        filename = req.body.filename || "typed-notes";
        pages = [{ page_number: 1, text: req.body.text.trim() }];
        emitProgress("extracted", 50, "Lecture notes text processed.");
      } else {
        sendError(res, "Either a file or text content must be provided.", 400, "MISSING_INPUT");
        return;
      }

      if (!pages.length || !pages.some((p) => p.text.trim())) {
        sendError(
          res,
          "No readable text could be found in the material. Please check that the note image or PDF is clear.",
          422,
          "UNREADABLE_DOCUMENT"
        );
        return;
      }

      emitProgress("generating", 75, "Generating flashcards, quiz questions, and summaries with AI...");

      const studyPack = await aiServiceClient.generateStudyPack({
        filename,
        pages,
        difficulty,
        flashcard_count: flashcardCount,
        quiz_count: quizCount,
      });

      const saved = storageService.saveStudyPack({
        ...studyPack,
        userId: req.user?.id,
      });

      emitProgress("completed", 100, "Study pack ready! All resources are saved for online and offline access.");

      // Also send a pipeline:success event over SSE for immediate frontend triggers
      if (sessionId) {
        sseManager.sendEvent(sessionId, "pipeline:success", {
          message: "Study pack created successfully!",
          packId: saved.id,
          timestamp: Date.now(),
        });
      }

      sendSuccess(
        res,
        "Study pack created successfully! Flashcards, summary, and quiz are ready.",
        saved,
        201
      );
    } catch (err: any) {
      if (sessionId) {
        sseManager.sendEvent(sessionId, "pipeline:error", {
          error: err.message || "Pipeline processing failed",
          timestamp: Date.now(),
        });
      }

      sendError(
        res,
        err.message || "Failed to process and generate study pack.",
        502,
        "PIPELINE_ERROR"
      );
    }
  }
);

export default router;
