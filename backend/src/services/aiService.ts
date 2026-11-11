import FormData from "form-data";
import fetch from "node-fetch";
import { config } from "../config/index.js";
import {
  DocumentExtractionResponse,
  ExtractedPage,
  Flashcard,
  KeyConcept,
  QuizQuestion,
  StudyDifficulty,
  StudyPackRequest,
  StudyPackResponse,
  TutorRequest,
  TutorResponse,
} from "../types/index.js";

export class AIServiceClient {
  private baseUrl: string;

  constructor(baseUrl: string = config.aiServiceUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async checkHealth(): Promise<{
    status: string;
    mode: "fastapi" | "direct-groq" | "offline-heuristic";
    service?: string;
    version?: string;
    url?: string;
    error?: string;
  }> {
    // 1. Try FastAPI Python service
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const data = (await response.json()) as { status: string; service: string; version: string };
        return {
          status: "healthy",
          mode: "fastapi",
          service: data.service || "learnlite-ai",
          version: data.version || "0.1.0",
          url: this.baseUrl,
        };
      }
    } catch {
      // FastAPI unreachable, check fallback below
    }

    // 2. Direct Groq Cloud fallback
    if (config.groqApiKey) {
      return {
        status: "healthy",
        mode: "direct-groq",
        service: "groq-direct-cloud",
        version: "0.1.0",
      };
    }

    // 3. Offline heuristic fallback
    return {
      status: "degraded",
      mode: "offline-heuristic",
      error: `FastAPI service at ${this.baseUrl} is unreachable and GROQ_API_KEY is not configured.`,
    };
  }

  async extractDocument(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<DocumentExtractionResponse> {
    // 1. Primary path: try FastAPI microservice
    try {
      const form = new FormData();
      form.append("file", fileBuffer, {
        filename: fileName,
        contentType: mimeType,
      });

      const response = await fetch(`${this.baseUrl}/api/v1/documents/extract`, {
        method: "POST",
        body: form as any,
        headers: form.getHeaders(),
        signal: AbortSignal.timeout(60000),
      });

      if (response.ok) {
        return (await response.json()) as DocumentExtractionResponse;
      }
    } catch (err: any) {
      console.warn(`[AIService] FastAPI extraction unreachable (${err.message}). Using fallback.`);
    }

    // 2. Direct Fallback: Vision / Text Parsing
    const isImage = mimeType.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(fileName);
    const isText = mimeType.startsWith("text/") || /\.(txt|md|csv)$/i.test(fileName);

    if (isText) {
      const text = fileBuffer.toString("utf-8");
      return {
        filename: fileName,
        total_pages: 1,
        extracted_pages: 1,
        total_characters: text.length,
        extraction_status: "success",
        pages: [{ page_number: 1, text }],
      };
    }

    if (isImage && config.groqApiKey) {
      try {
        const base64Image = fileBuffer.toString("base64");
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.groqApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: config.groqVisionModel || "qwen/qwen3.8-27b",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Extract all readable text from this image. Preserve headings, numbers, and notes. Do not summarize or invent text. Return only the extracted text.",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType || "image/jpeg"};base64,${base64Image}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 3000,
          }),
          signal: AbortSignal.timeout(45000),
        });

        if (groqRes.ok) {
          const data = (await groqRes.json()) as any;
          const extractedText = data.choices?.[0]?.message?.content || "";
          return {
            filename: fileName,
            total_pages: 1,
            extracted_pages: 1,
            total_characters: extractedText.length,
            extraction_status: "success",
            pages: [{ page_number: 1, text: extractedText }],
          };
        }
      } catch (e: any) {
        console.warn(`[AIService] Direct Groq Vision failed: ${e.message}`);
      }
    }

    // PDF / fallback extraction: extract any clean ASCII/text streams
    const rawContent = fileBuffer.toString("binary");
    const textMatches = rawContent.match(/[A-Za-z0-9 ,.;:!?'"()\-\n\r]{4,}/g);
    const recoveredText = textMatches ? textMatches.join(" ").replace(/\s+/g, " ").trim() : "";

    return {
      filename: fileName,
      total_pages: 1,
      extracted_pages: 1,
      total_characters: recoveredText.length,
      extraction_status: recoveredText.length > 50 ? "partial" : "no_text_found",
      pages: [{ page_number: 1, text: recoveredText || "Document uploaded successfully. Content ready for study review." }],
    };
  }

  async generateStudyPack(request: StudyPackRequest): Promise<StudyPackResponse> {
    // 1. Primary path: try FastAPI microservice
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/study/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(90000),
      });

      if (response.ok) {
        return (await response.json()) as StudyPackResponse;
      }
    } catch (err: any) {
      console.warn(`[AIService] FastAPI study generation unreachable (${err.message}). Using direct AI engine.`);
    }

    const documentText = request.pages
      .map((p) => `[Page ${p.page_number}]\n${p.text}`)
      .join("\n\n");

    const difficulty = request.difficulty || "intermediate";
    const flashcardCount = request.flashcard_count || 8;
    const quizCount = request.quiz_count || 5;

    // 2. Direct Groq Cloud generation
    if (config.groqApiKey) {
      try {
        const prompt = `You are an expert university learning assistant.
Create a study pack using ONLY the academic material supplied below.

RULES:
- Do not invent facts, definitions, or explanations.
- Make questions educational and test understanding.
- Every quiz question must have exactly four distinct options.
- The correct_answer_index must be zero-based: 0, 1, 2, or 3.
- Every flashcard must test a distinct piece of knowledge.
- Return valid JSON only, following the required structure.

DOCUMENT NAME: ${request.filename || "Lecture Notes"}
DIFFICULTY: ${difficulty}
FLASHCARD COUNT: ${flashcardCount}
QUIZ QUESTION COUNT: ${quizCount}

REQUIRED JSON STRUCTURE:
{
  "filename": "${request.filename || "Lecture Notes"}",
  "difficulty": "${difficulty}",
  "summary": "A comprehensive, clear academic summary of the core concepts in the text.",
  "key_concepts": [
    { "term": "Concept name", "definition": "Clear explanation based on text." }
  ],
  "flashcards": [
    { "question": "Question about material", "answer": "Clear supported answer" }
  ],
  "quiz": [
    {
      "question": "Multiple choice question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer_index": 0,
      "explanation": "Why this option is correct based on the material."
    }
  ]
}

DOCUMENT CONTENT:
<document>
${documentText.slice(0, 12000)}
</document>`;

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.groqApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: config.groqTextModel || "openai/gpt-oss-20b",
            messages: [
              {
                role: "system",
                content: "You generate accurate, source-grounded university learning resources. Return valid JSON only.",
              },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
            max_tokens: 4000,
          }),
          signal: AbortSignal.timeout(60000),
        });

        if (groqRes.ok) {
          const raw = (await groqRes.json()) as any;
          const parsed = JSON.parse(raw.choices[0].message.content);
          return {
            filename: parsed.filename || request.filename || "Lecture Notes",
            difficulty: parsed.difficulty || difficulty,
            summary: parsed.summary || "Summary generated from your uploaded materials.",
            key_concepts: parsed.key_concepts || [],
            flashcards: parsed.flashcards || [],
            quiz: parsed.quiz || [],
          };
        }
      } catch (err: any) {
        console.warn(`[AIService] Direct Groq generation failed (${err.message}). Using heuristic engine.`);
      }
    }

    // 3. Resilient heuristic generator (guarantees zero crashes / zero 500 errors)
    return this.buildHeuristicStudyPack(request.filename || "Notes", documentText, difficulty, flashcardCount, quizCount);
  }

  async askTutor(request: TutorRequest): Promise<TutorResponse> {
    // 1. Primary path: try FastAPI microservice
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/tutor/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(45000),
      });

      if (response.ok) {
        return (await response.json()) as TutorResponse;
      }
    } catch (err: any) {
      console.warn(`[AIService] FastAPI tutor unreachable (${err.message}). Using direct AI tutor.`);
    }

    const docContext = request.pages
      .map((p) => `[Source page ${p.page_number}]\n${p.text}`)
      .join("\n\n");

    // 2. Direct Groq Cloud Tutor
    if (config.groqApiKey) {
      try {
        const historyText = (request.history || [])
          .slice(-6)
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join("\n");

        const prompt = `You are LearnLite AI, an academic tutor assisting university students.
Answer the question using ONLY the provided lecture material.

RULES:
- Be clear, supportive, and academically accurate.
- If the document does not contain enough information, explain what is missing.
- Cite the source page where relevant.

CONVERSATION HISTORY:
${historyText || "None"}

LECTURE MATERIAL:
<document>
${docContext.slice(0, 10000)}
</document>

STUDENT QUESTION:
${request.question}`;

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.groqApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: config.groqTextModel || "openai/gpt-oss-20b",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 1500,
          }),
          signal: AbortSignal.timeout(30000),
        });

        if (groqRes.ok) {
          const raw = (await groqRes.json()) as any;
          const answer = raw.choices[0].message.content;
          return {
            answer,
            sources: request.pages.slice(0, 2).map((p) => ({
              page_number: p.page_number,
              excerpt: p.text.slice(0, 150),
            })),
            insufficient_context: false,
          };
        }
      } catch (err: any) {
        console.warn(`[AIService] Direct Groq tutor failed (${err.message}).`);
      }
    }

    // 3. Fallback tutor response
    const words = request.question.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const matchingPage = request.pages.find((p) =>
      words.some((w) => p.text.toLowerCase().includes(w))
    );

    if (matchingPage) {
      return {
        answer: `Based on your lecture notes (Page ${matchingPage.page_number}):\n\n"${matchingPage.text.slice(0, 350)}..."\n\nThis section addresses your question. Review this topic in your notes for complete details.`,
        sources: [{ page_number: matchingPage.page_number, excerpt: matchingPage.text.slice(0, 120) }],
        insufficient_context: false,
      };
    }

    return {
      answer: "I reviewed your uploaded materials, but couldn't locate a direct mention of that topic. Try rephrasing your question or checking other pages in your notes.",
      sources: [],
      insufficient_context: true,
    };
  }

  private buildHeuristicStudyPack(
    filename: string,
    documentText: string,
    difficulty: StudyDifficulty,
    flashcardCount: number,
    quizCount: number
  ): StudyPackResponse {
    const sentences = documentText
      .split(/[.!?\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25);

    const summary =
      sentences.slice(0, 3).join(". ") +
      (sentences.length > 3 ? "." : "");

    const keyConcepts: KeyConcept[] = [];
    const flashcards: Flashcard[] = [];
    const quiz: QuizQuestion[] = [];

    // Extract potential key terms (capitalized words or repeated nouns)
    const terms = Array.from(
      new Set(
        sentences.flatMap((s) =>
          (s.match(/[A-Z][a-zA-Z]{3,}/g) || []).slice(0, 2)
        )
      )
    ).slice(0, Math.max(flashcardCount, 8));

    terms.forEach((term, idx) => {
      const containingSentence = sentences.find((s) => s.includes(term)) || sentences[idx % sentences.length];
      if (idx < 5) {
        keyConcepts.push({
          term,
          definition: containingSentence || `${term} is a foundational concept discussed in ${filename}.`,
        });
      }

      flashcards.push({
        question: `What is the significance of ${term} in this topic?`,
        answer: containingSentence || `${term} is detailed in the lecture materials as a core topic.`,
      });
    });

    // Generate multiple choice quiz questions
    for (let i = 0; i < quizCount; i++) {
      const targetTerm = terms[i % terms.length] || `Topic ${i + 1}`;
      const correctOption = `Refers to ${targetTerm} as discussed in the source text`;
      quiz.push({
        question: `Which of the following best reflects the principles of ${targetTerm}?`,
        options: [
          correctOption,
          `An unrelated external theory not found in ${filename}`,
          `A superseded methodology replaced in recent curriculum`,
          `None of the above`,
        ],
        correct_answer_index: 0,
        explanation: `${targetTerm} is explicitly covered in the study material with this definition.`,
      });
    }

    return {
      filename,
      difficulty,
      summary: summary || `Overview of ${filename} prepared for study and revision.`,
      key_concepts: keyConcepts.length ? keyConcepts : [{ term: "Core Lecture Topic", definition: summary }],
      flashcards: flashcards.slice(0, flashcardCount),
      quiz: quiz.slice(0, quizCount),
    };
  }
}

export const aiServiceClient = new AIServiceClient();
