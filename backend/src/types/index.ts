export interface ExtractedPage {
  page_number: number;
  text: string;
}

export interface DocumentExtractionResponse {
  filename: string;
  total_pages: number;
  extracted_pages: number;
  total_characters: number;
  extraction_status: "success" | "partial" | "no_text_found" | string;
  pages: ExtractedPage[];
}

export interface KeyConcept {
  term: string;
  definition: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: [string, string, string, string] | string[];
  correct_answer_index: number;
  explanation: string;
}

export type StudyDifficulty = "beginner" | "intermediate" | "advanced";

export interface StudyPackRequest {
  filename?: string;
  pages: ExtractedPage[];
  difficulty?: StudyDifficulty;
  flashcard_count?: number;
  quiz_count?: number;
  userId?: string;
}

export interface StudyPackResponse {
  id?: string;
  userId?: string;
  createdAt?: string;
  filename: string;
  difficulty: StudyDifficulty;
  summary: string;
  key_concepts: KeyConcept[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TutorRequest {
  filename?: string;
  pages: ExtractedPage[];
  question: string;
  history?: ChatMessage[];
  conversation_summary?: string | null;
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

export interface QuizAttempt {
  packId: string;
  questionIndex: number;
  selectedIndex: number;
  isCorrect: boolean;
  timestamp: number;
  userId?: string;
}

export interface OfflineSyncRequest {
  clientId: string;
  userId?: string;
  quizAttempts?: QuizAttempt[];
  completedPacks?: string[];
  timestamp?: number;
}

export interface OfflineSyncResponse {
  success: boolean;
  syncedAttemptsCount: number;
  syncedPacksCount: number;
  serverTimestamp: number;
}

// -------------------------------------------------------------
// Authentication & User Model Types
// -------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  institution?: string; // University name
  department?: string; // Department / Program
  preferredLanguage: string; // 'en', 'fr', 'es', 'ha', 'yo', 'ig' etc.
  isGuest: boolean;
  role: "student" | "admin";
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<User, "passwordHash">;

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  institution?: string;
  department?: string;
  preferredLanguage?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GuestRequest {
  name?: string;
  institution?: string;
  preferredLanguage?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  institution?: string;
  department?: string;
  preferredLanguage?: string;
}

export interface AuthResponse {
  user: SafeUser;
  token: string;
  expiresIn: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  isGuest: boolean;
  role: "student" | "admin";
  iat?: number;
  exp?: number;
}
