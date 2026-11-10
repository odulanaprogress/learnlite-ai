import { Router, Request, Response, NextFunction } from "express";
import { authService } from "../services/authService.js";
import { requireAuth } from "../middleware/auth.js";
import { sendSuccess, sendError } from "../utils/response.js";
import {
  GuestRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from "../types/index.js";

const router = Router();

// 1. Register new student account
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input: RegisterRequest = req.body;
    const result = await authService.register(input);
    sendSuccess(
      res,
      "Welcome to LearnLite! Your student account has been created successfully.",
      result,
      201
    );
  } catch (err: any) {
    if (err.message?.includes("already exists")) {
      sendError(res, err.message, 409, "ACCOUNT_ALREADY_EXISTS");
      return;
    }
    sendError(res, err.message || "Failed to register student account.", 400, "REGISTRATION_FAILED");
  }
});

// 2. Login with email & password
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input: LoginRequest = req.body;
    const result = await authService.login(input);
    sendSuccess(
      res,
      `Welcome back, ${result.user.name}!`,
      result,
      200
    );
  } catch (err: any) {
    sendError(res, err.message || "Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }
});

// 3. Create instant guest session (for low-connectivity / frictionless onboarding)
router.post("/guest", (req: Request, res: Response) => {
  try {
    const input: GuestRequest = req.body;
    const result = authService.createGuest(input);
    sendSuccess(
      res,
      "Guest session initialized. You can now use LearnLite offline or in low connectivity.",
      result,
      201
    );
  } catch (err: any) {
    sendError(res, err.message || "Failed to create guest session.", 500, "GUEST_SESSION_ERROR");
  }
});

// 4. Get authenticated student profile
router.get("/me", requireAuth, (req: Request, res: Response) => {
  sendSuccess(res, "Profile loaded successfully.", req.user, 200);
});

// 5. Update student profile
router.put("/profile", requireAuth, (req: Request, res: Response) => {
  try {
    const input: UpdateProfileRequest = req.body;
    const updated = authService.updateProfile(req.user!.id, input);
    sendSuccess(res, "Your profile preferences have been updated.", updated, 200);
  } catch (err: any) {
    sendError(res, err.message || "Failed to update profile.", 400, "PROFILE_UPDATE_FAILED");
  }
});

// 6. Logout
router.post("/logout", (_req: Request, res: Response) => {
  sendSuccess(res, "You have been logged out successfully.", null, 200);
});

export default router;
