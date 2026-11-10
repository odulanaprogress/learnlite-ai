import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService.js";

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  return null;
}

/**
 * Middleware that requires a valid JWT token.
 * Returns 401 Unauthorized if missing, malformed, or expired.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: "Authentication token is required." });
    return;
  }

  try {
    const payload = authService.verifyToken(token);
    const profile = authService.getProfile(payload.userId);
    req.user = profile;
    next();
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Invalid or expired authentication token." });
  }
}

/**
 * Middleware that optionally attaches the user if a valid JWT is present,
 * but allows unauthenticated/guest requests to proceed.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    const payload = authService.verifyToken(token);
    const profile = authService.getProfile(payload.userId);
    req.user = profile;
  } catch {
    // If optional token is invalid, silently proceed without req.user
  }

  next();
}

