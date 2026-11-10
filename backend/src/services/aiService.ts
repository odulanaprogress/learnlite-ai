import FormData from "form-data";
import fetch from "node-fetch";
import { config } from "../config/index.js";
import {
  DocumentExtractionResponse,
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

  async checkHealth(): Promise<{ status: string; service?: string; version?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return {
          status: "unhealthy",
          error: `AI service responded with HTTP ${response.status}`,
        };
      }

      const data = (await response.json()) as { status: string; service: string; version: string };
      return data;
    } catch (err: any) {
      return {
        status: "unreachable",
        error: err.message || "Failed to reach AI service",
      };
    }
  }

  async extractDocument(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<DocumentExtractionResponse> {
    const form = new FormData();
    form.append("file", fileBuffer, {
      filename: fileName,
      contentType: mimeType,
    });

    const response = await fetch(`${this.baseUrl}/api/v1/documents/extract`, {
      method: "POST",
      body: form as any,
      headers: form.getHeaders(),
      signal: AbortSignal.timeout(120000), // 2 min timeout for OCR / multi-page PDFs
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = `AI Service extraction failed with status ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) message = errorJson.detail;
      } catch {
        if (errorText) message = errorText;
      }
      throw new Error(message);
    }

    return (await response.json()) as DocumentExtractionResponse;
  }

  async generateStudyPack(request: StudyPackRequest): Promise<StudyPackResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/study/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(180000), // 3 min timeout for Groq LLM + semantic grounding validation
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = `AI Service study generation failed with status ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) message = errorJson.detail;
      } catch {
        if (errorText) message = errorText;
      }
      throw new Error(message);
    }

    return (await response.json()) as StudyPackResponse;
  }

  async askTutor(request: TutorRequest): Promise<TutorResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/tutor/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(90000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = `AI Service tutor failed with status ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) message = errorJson.detail;
      } catch {
        if (errorText) message = errorText;
      }
      throw new Error(message);
    }

    return (await response.json()) as TutorResponse;
  }
}

export const aiServiceClient = new AIServiceClient();
