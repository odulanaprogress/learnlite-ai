import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/index.js";
import { storageService } from "./storageService.js";
import {
  AuthResponse,
  GuestRequest,
  JWTPayload,
  LoginRequest,
  RegisterRequest,
  SafeUser,
  UpdateProfileRequest,
  User,
} from "../types/index.js";

export class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = config.jwtSecret;
    this.jwtExpiresIn = config.jwtExpiresIn;
  }

  private generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as any,
    });
  }

  private stripPassword(user: User): SafeUser {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async register(input: RegisterRequest): Promise<AuthResponse> {
    const email = input.email?.trim().toLowerCase();
    const name = input.name?.trim();
    const password = input.password;

    if (!name) {
      throw new Error("Student name is required.");
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("A valid email address is required.");
    }

    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    const existing = storageService.findUserByEmail(email);
    if (existing && !existing.isGuest) {
      throw new Error("An account with this email address already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const user: User = {
      id: existing?.isGuest ? existing.id : uuidv4(),
      email,
      name,
      passwordHash,
      institution: input.institution?.trim() || undefined,
      department: input.department?.trim() || undefined,
      preferredLanguage: input.preferredLanguage || "en",
      isGuest: false,
      role: "student",
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    if (existing?.isGuest) {
      storageService.updateUser(existing.id, user);
    } else {
      storageService.createUser(user);
    }

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      isGuest: false,
      role: user.role,
    });

    return {
      user: this.stripPassword(user),
      token,
      expiresIn: this.jwtExpiresIn,
    };
  }

  async login(input: LoginRequest): Promise<AuthResponse> {
    const email = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const user = storageService.findUserByEmail(email);
    if (!user || user.isGuest || !user.passwordHash) {
      throw new Error("Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      isGuest: false,
      role: user.role,
    });

    return {
      user: this.stripPassword(user),
      token,
      expiresIn: this.jwtExpiresIn,
    };
  }

  createGuest(input: GuestRequest = {}): AuthResponse {
    const guestId = uuidv4();
    const shortId = guestId.slice(0, 8);
    const now = new Date().toISOString();

    const user: User = {
      id: guestId,
      email: `guest_${shortId}@learnlite.local`,
      name: input.name?.trim() || `Student ${shortId}`,
      institution: input.institution?.trim() || undefined,
      preferredLanguage: input.preferredLanguage || "en",
      isGuest: true,
      role: "student",
      createdAt: now,
      updatedAt: now,
    };

    storageService.createUser(user);

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      isGuest: true,
      role: user.role,
    });

    return {
      user: this.stripPassword(user),
      token,
      expiresIn: this.jwtExpiresIn,
    };
  }

  verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
      return decoded;
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw new Error("Authentication token has expired. Please log in again.");
      }
      throw new Error("Invalid authentication token.");
    }
  }

  getProfile(userId: string): SafeUser {
    const user = storageService.findUserById(userId);
    if (!user) {
      throw new Error("User not found.");
    }
    return this.stripPassword(user);
  }

  updateProfile(userId: string, input: UpdateProfileRequest): SafeUser {
    const user = storageService.findUserById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const updates: Partial<User> = {};
    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.institution !== undefined) updates.institution = input.institution.trim();
    if (input.department !== undefined) updates.department = input.department.trim();
    if (input.preferredLanguage !== undefined) updates.preferredLanguage = input.preferredLanguage.trim();

    const updated = storageService.updateUser(userId, updates);
    if (!updated) {
      throw new Error("Failed to update user profile.");
    }

    return this.stripPassword(updated);
  }
}

export const authService = new AuthService();

