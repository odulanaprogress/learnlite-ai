import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/index.js";
import {
  QuizAttempt,
  StudyPackResponse,
  User,
} from "../types/index.js";

export class StorageService {
  private users: Map<string, User> = new Map(); // id -> User
  private usersByEmail: Map<string, string> = new Map(); // lowercase email -> id
  private studyPacks: Map<string, StudyPackResponse> = new Map(); // id -> StudyPackResponse
  private quizAttempts: Map<string, QuizAttempt[]> = new Map(); // clientId/userId -> attempts
  private dataDir: string;

  constructor() {
    this.dataDir = path.resolve(process.cwd(), config.dataDir);
    this.ensureDataDirectory();
    this.loadFromDisk();
  }

  private ensureDataDirectory(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
    } catch (err) {
      console.warn("StorageService: could not create data directory, running in-memory only:", err);
    }
  }

  private loadFromDisk(): void {
    try {
      const usersFile = path.join(this.dataDir, "users.json");
      if (fs.existsSync(usersFile)) {
        const raw = fs.readFileSync(usersFile, "utf-8");
        const parsed = JSON.parse(raw) as User[];
        for (const user of parsed) {
          this.users.set(user.id, user);
          if (user.email) {
            this.usersByEmail.set(user.email.toLowerCase(), user.id);
          }
        }
      }

      const packsFile = path.join(this.dataDir, "study-packs.json");
      if (fs.existsSync(packsFile)) {
        const raw = fs.readFileSync(packsFile, "utf-8");
        const parsed = JSON.parse(raw) as StudyPackResponse[];
        for (const pack of parsed) {
          if (pack.id) this.studyPacks.set(pack.id, pack);
        }
      }

      const attemptsFile = path.join(this.dataDir, "attempts.json");
      if (fs.existsSync(attemptsFile)) {
        const raw = fs.readFileSync(attemptsFile, "utf-8");
        const parsed = JSON.parse(raw) as Record<string, QuizAttempt[]>;
        for (const [key, attempts] of Object.entries(parsed)) {
          this.quizAttempts.set(key, attempts);
        }
      }
    } catch (err) {
      console.warn("StorageService: warning loading persistent data, starting clean:", err);
    }
  }

  private persistUsers(): void {
    try {
      this.ensureDataDirectory();
      const usersFile = path.join(this.dataDir, "users.json");
      const list = Array.from(this.users.values());
      fs.writeFileSync(usersFile, JSON.stringify(list, null, 2), "utf-8");
    } catch (err) {
      console.error("StorageService: failed to persist users to disk:", err);
    }
  }

  private persistStudyPacks(): void {
    try {
      this.ensureDataDirectory();
      const packsFile = path.join(this.dataDir, "study-packs.json");
      const list = Array.from(this.studyPacks.values());
      fs.writeFileSync(packsFile, JSON.stringify(list, null, 2), "utf-8");
    } catch (err) {
      console.error("StorageService: failed to persist study packs to disk:", err);
    }
  }

  private persistAttempts(): void {
    try {
      this.ensureDataDirectory();
      const attemptsFile = path.join(this.dataDir, "attempts.json");
      const record: Record<string, QuizAttempt[]> = {};
      for (const [k, v] of this.quizAttempts.entries()) {
        record[k] = v;
      }
      fs.writeFileSync(attemptsFile, JSON.stringify(record, null, 2), "utf-8");
    } catch (err) {
      console.error("StorageService: failed to persist quiz attempts to disk:", err);
    }
  }

  // ---------------- User Operations ----------------

  createUser(user: User): User {
    this.users.set(user.id, user);
    if (user.email) {
      this.usersByEmail.set(user.email.toLowerCase(), user.id);
    }
    this.persistUsers();
    return user;
  }

  findUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  findUserByEmail(email: string): User | undefined {
    const id = this.usersByEmail.get(email.toLowerCase().trim());
    if (!id) return undefined;
    return this.users.get(id);
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updated: User = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.email && updates.email !== user.email) {
      this.usersByEmail.delete(user.email.toLowerCase());
      this.usersByEmail.set(updates.email.toLowerCase(), id);
    }

    this.users.set(id, updated);
    this.persistUsers();
    return updated;
  }

  // ---------------- Study Pack Operations ----------------

  saveStudyPack(pack: StudyPackResponse): StudyPackResponse {
    const id = pack.id || uuidv4();
    const savedPack: StudyPackResponse = {
      ...pack,
      id,
      createdAt: pack.createdAt || new Date().toISOString(),
    };
    this.studyPacks.set(id, savedPack);
    this.persistStudyPacks();
    return savedPack;
  }

  getStudyPack(id: string): StudyPackResponse | undefined {
    return this.studyPacks.get(id);
  }

  getAllStudyPacks(userId?: string): StudyPackResponse[] {
    let packs = Array.from(this.studyPacks.values());
    if (userId) {
      // Return user's packs plus any public unassigned packs
      packs = packs.filter((p) => !p.userId || p.userId === userId);
    }
    return packs.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  // ---------------- Quiz Attempts Operations ----------------

  recordQuizAttempts(key: string, attempts: QuizAttempt[]): number {
    const existing = this.quizAttempts.get(key) || [];
    this.quizAttempts.set(key, [...existing, ...attempts]);
    this.persistAttempts();
    return attempts.length;
  }

  getQuizAttempts(key: string): QuizAttempt[] {
    return this.quizAttempts.get(key) || [];
  }
}

export const storageService = new StorageService();
