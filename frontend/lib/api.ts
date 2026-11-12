import { generateOfflineStudyPack } from "./offlineGenerator";
import { answerOfflineQuestion } from "./offlineTutor";
/**
 * LearnLite AI API Client
 * Connects the frontend directly to the production backend on Render.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://learnlite-ai-backend.onrender.com";

const TOKEN_KEY = "learnlite_token";
const USER_KEY = "learnlite_user";
const LATEST_PACK_KEY = "learnlite_latest_study_pack";

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  institution?: string;
  department?: string;
  preferredLanguage?: string;
  isGuest: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface KeyConcept {
  term: string;
  definition: string;
}

export interface Flashcard {
  question: string;
  answer: string;
  category?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

export interface StudyPack {
  id: string;
  filename: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  summary: string;
  key_concepts: KeyConcept[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  createdAt: string;
  userId?: string;
}

export interface TutorSource {
  page_number: number;
  excerpt: string;
}

export interface TutorResponse {
  answer: string;
  sources: TutorSource[];
  insufficient_context: boolean;
}

export interface ProgressEventPayload {
  stage: string;
  progress: number;
  message: string;
  timestamp: number;
}

export const api = {
  // ── Authentication & Session Helpers ───────────────────────────
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  getUser(): SafeUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SafeUser;
    } catch {
      return null;
    }
  },

  setUser(user: SafeUser): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getLatestStudyPack(): StudyPack | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(LATEST_PACK_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StudyPack;
    } catch {
      return null;
    }
  },

  saveLatestStudyPack(pack: StudyPack): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(LATEST_PACK_KEY, JSON.stringify(pack));
  },

  // ── Base HTTP Fetcher ──────────────────────────────────────────
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers = new Headers(options.headers || {});
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg =
        data?.error || data?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return (data?.data ?? data) as T;
  },

  // ── Auth Endpoints ─────────────────────────────────────────────
  auth: {
    async register(input: {
      name: string;
      email: string;
      password: string;
      institution?: string;
      department?: string;
    }): Promise<{ user: SafeUser; token: string }> {
      const result = await api.request<{ user: SafeUser; token: string }>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      api.setToken(result.token);
      api.setUser(result.user);
      return result;
    },

    async login(input: {
      email: string;
      password: string;
    }): Promise<{ user: SafeUser; token: string }> {
      const result = await api.request<{ user: SafeUser; token: string }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });
      api.setToken(result.token);
      api.setUser(result.user);
      return result;
    },

    async guest(input: {
      name?: string;
      institution?: string;
    } = {}): Promise<{ user: SafeUser; token: string }> {
      const result = await api.request<{ user: SafeUser; token: string }>("/api/v1/auth/guest", {
        method: "POST",
        body: JSON.stringify(input),
      });
      api.setToken(result.token);
      api.setUser(result.user);
      return result;
    },

    async me(): Promise<SafeUser> {
      const user = await api.request<SafeUser>("/api/v1/auth/me", {
        method: "GET",
      });
      api.setUser(user);
      return user;
    },

    logout(): void {
      api.clearSession();
    },
  },

  // ── Document Ingestion & Real-Time Pipeline ─────────────────────
  documents: {
    async processAndGenerate(params: {
      file?: File;
      text?: string;
      filename?: string;
      difficulty?: "beginner" | "intermediate" | "advanced";
      flashcardCount?: number;
      quizCount?: number;
      onProgress?: (progress: ProgressEventPayload) => void;
    }): Promise<StudyPack> {
      const sessionId = crypto.randomUUID();
      let eventSource: EventSource | null = null;

      // 1. Attach Real-Time SSE listener for live progress
      if (params.onProgress && typeof window !== "undefined") {
        try {
          eventSource = new EventSource(`${API_BASE_URL}/api/v1/events/${sessionId}`);

          eventSource.addEventListener("pipeline:progress", (event) => {
            try {
              const data = JSON.parse(event.data) as ProgressEventPayload;
              params.onProgress?.(data);
            } catch (err) {
              console.warn("Error parsing progress event:", err);
            }
          });

          eventSource.onerror = () => {
            // Server-Sent events may close gracefully on finish
          };
        } catch (err) {
          console.warn("SSE connection could not be established:", err);
        }
      }

      try {
        const token = api.getToken();
        const headers: Record<string, string> = {
          "x-session-id": sessionId,
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        let body: BodyInit;

        if (params.file) {
          const form = new FormData();
          form.append("file", params.file, params.file.name);
          form.append("sessionId", sessionId);
          form.append("difficulty", params.difficulty || "intermediate");
          form.append("flashcardCount", String(params.flashcardCount || 8));
          form.append("quizCount", String(params.quizCount || 5));
          body = form;
        } else if (params.text) {
          headers["Content-Type"] = "application/json";
          body = JSON.stringify({
            text: params.text,
            filename: params.filename || "pasted-notes",
            sessionId,
            difficulty: params.difficulty || "intermediate",
            flashcardCount: params.flashcardCount || 8,
            quizCount: params.quizCount || 5,
          });
        } else {
          throw new Error("Either a file or text content is required.");
        }

        if (typeof window !== "undefined" && !navigator.onLine && params.text) {
          const offlinePack = generateOfflineStudyPack(params.text, params.filename, params.difficulty);
          api.saveLatestStudyPack(offlinePack);
          return offlinePack;
        }

        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/documents/process-and-generate`, {
            method: "POST",
            headers,
            body,
          });

          const json = await res.json();

          if (!res.ok) {
            throw new Error(json?.error || json?.message || "Failed to process document and generate study pack.");
          }

          const pack = (json?.data ?? json) as StudyPack;
          api.saveLatestStudyPack(pack);
          return pack;
        } catch (fetchErr: any) {
          if (params.text) {
            console.warn("[LearnLite API] Network request failed. Falling back to client-side study generator:", fetchErr);
            const offlinePack = generateOfflineStudyPack(params.text, params.filename, params.difficulty);
            api.saveLatestStudyPack(offlinePack);
            return offlinePack;
          }
          throw fetchErr;
        }
      } finally {
        if (eventSource) {
          eventSource.close();
        }
      }
    },
  },

  // ── Study Packs ────────────────────────────────────────────────
  study: {
    async getPacks(): Promise<StudyPack[]> {
      return api.request<StudyPack[]>("/api/v1/study/packs", { method: "GET" });
    },

    async getPack(id: string): Promise<StudyPack> {
      return api.request<StudyPack>(`/api/v1/study/packs/${id}`, { method: "GET" });
    },
  },

  // ── AI Tutor Q&A ───────────────────────────────────────────────
  tutor: {
    async ask(params: {
      question: string;
      pages: { page_number: number; text: string }[];
      filename?: string;
      history?: { role: "user" | "assistant"; content: string }[];
    }): Promise<TutorResponse> {
      return api.request<TutorResponse>("/api/v1/tutor/ask", {
        method: "POST",
        body: JSON.stringify(params),
      });
    },

    async stream(params: {
      question: string;
      pages: { page_number: number; text: string }[];
      filename?: string;
      history?: { role: "user" | "assistant"; content: string }[];
      onToken: (tokenText: string) => void;
      onDone?: (fullResponse: any) => void;
      onError?: (err: Error) => void;
    }): Promise<void> {
      const url = `${API_BASE_URL}/api/v1/tutor/stream`;
      const token = api.getToken();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            question: params.question,
            pages: params.pages,
            filename: params.filename,
            history: params.history,
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`Tutor stream failed with status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const block of lines) {
            const eventMatch = block.match(/^event:\s*(\w+)/m);
            const dataMatch = block.match(/^data:\s*(.+)$/m);

            if (eventMatch && dataMatch) {
              const eventType = eventMatch[1];
              try {
                const parsed = JSON.parse(dataMatch[1]);
                if (eventType === "token" && parsed.text) {
                  params.onToken(parsed.text);
                } else if (eventType === "done") {
                  params.onDone?.(parsed);
                } else if (eventType === "error") {
                  throw new Error(parsed.message || "Tutor streaming error");
                }
              } catch (e) {
                // Ignore parse errors on raw tokens
              }
            }
          }
        }
      } catch (err: any) {
        params.onError?.(err);
      }
    },
  },
};
