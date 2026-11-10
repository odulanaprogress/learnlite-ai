import { Router, Request, Response } from "express";
import { aiServiceClient } from "../services/aiService.js";
import { optionalAuth } from "../middleware/auth.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { TutorRequest } from "../types/index.js";

const router = Router();

// 1. Standard POST request for AI Tutor Q&A
router.post("/ask", optionalAuth, async (req: Request, res: Response) => {
  try {
    const tutorReq: TutorRequest = req.body;

    if (!tutorReq.question || !tutorReq.question.trim()) {
      sendError(res, "Please provide a question for the AI Tutor.", 400, "EMPTY_QUESTION");
      return;
    }

    if (!tutorReq.pages || !Array.isArray(tutorReq.pages) || tutorReq.pages.length === 0) {
      sendError(res, "Document pages or lecture notes are required to ground tutor responses.", 400, "MISSING_CONTEXT");
      return;
    }

    const answer = await aiServiceClient.askTutor({
      ...tutorReq,
      userId: req.user?.id || tutorReq.userId,
    });

    sendSuccess(
      res,
      answer.insufficient_context
        ? "Tutor could not find sufficient context in your notes to fully answer, but provided guidance."
        : "Tutor answered your question based on your uploaded lecture notes.",
      answer,
      200
    );
  } catch (err: any) {
    sendError(res, err.message || "Failed to get an answer from the AI Tutor.", 502, "TUTOR_FAILED");
  }
});

// 2. Real-time streaming response over SSE (Ideal for 2G / low-bandwidth mobile devices)
router.post("/stream", optionalAuth, async (req: Request, res: Response) => {
  const tutorReq: TutorRequest = req.body;

  if (!tutorReq.question || !tutorReq.question.trim()) {
    sendError(res, "Please provide a question for the AI Tutor.", 400, "EMPTY_QUESTION");
    return;
  }

  // Set SSE response headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  if (typeof (res as any).flushHeaders === "function") {
    (res as any).flushHeaders();
  }

  try {
    res.write(`event: status\ndata: ${JSON.stringify({ message: "Searching your lecture notes for answers..." })}\n\n`);

    const result = await aiServiceClient.askTutor({
      ...tutorReq,
      userId: req.user?.id || tutorReq.userId,
    });

    // Stream the answer content in small token chunks
    const words = result.answer.split(" ");
    const chunkSize = 4;

    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(" ") + " ";
      res.write(`event: token\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
      await new Promise((r) => setTimeout(r, 40));
    }

    // Send final full response with citations and grounding metadata
    res.write(
      `event: done\ndata: ${JSON.stringify({
        success: true,
        message: "Answer completed.",
        answer: result.answer,
        sources: result.sources,
        insufficient_context: result.insufficient_context,
      })}\n\n`
    );

    res.end();
  } catch (err: any) {
    res.write(
      `event: error\ndata: ${JSON.stringify({
        success: false,
        message: err.message || "Failed to generate tutor response",
        code: "TUTOR_STREAM_ERROR",
      })}\n\n`
    );
    res.end();
  }
});

export default router;
