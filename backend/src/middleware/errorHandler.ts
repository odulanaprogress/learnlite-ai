import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import { sendError } from "../utils/response.js";

/**
 * 404 Route Not Found Middleware
 */
export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    `Route ${req.method} ${req.originalUrl} does not exist.`,
    404,
    "ROUTE_NOT_FOUND"
  );
}

/**
 * Global Centralized Error Handling Middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Custom Operational Application Errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errorCode, err.details);
    return;
  }

  // 2. Multer (File Upload) Errors
  if (err.name === "MulterError") {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        sendError(
          res,
          "Uploaded file exceeds the maximum size limit (15MB). Please upload a smaller document.",
          413,
          "FILE_TOO_LARGE",
          { limitMb: 15 }
        );
        return;
      case "LIMIT_UNEXPECTED_FILE":
        sendError(
          res,
          `Unexpected upload field '${err.field}'. Please attach your document under the 'file' field.`,
          400,
          "INVALID_UPLOAD_FIELD"
        );
        return;
      default:
        sendError(
          res,
          `File upload error: ${err.message}`,
          400,
          "FILE_UPLOAD_ERROR"
        );
        return;
    }
  }

  // 3. Body-Parser / Express Malformed JSON Syntax Errors
  if (err instanceof SyntaxError && "body" in err) {
    sendError(
      res,
      "Malformed JSON detected in request body. Please verify your JSON payload.",
      400,
      "INVALID_JSON_BODY"
    );
    return;
  }

  // 4. Downstream AI Service Network / Connection Errors
  if (
    err.code === "ECONNREFUSED" ||
    err.code === "ENOTFOUND" ||
    err.message?.includes("fetch failed") ||
    err.name === "TimeoutError"
  ) {
    console.error(`[AI Service Unreachable] ${err.message} on ${req.method} ${req.url}`);
    sendError(
      res,
      "AI Service is currently offline or unreachable. Please ensure the Python AI Service is running.",
      502,
      "AI_SERVICE_UNAVAILABLE",
      { originalError: err.message }
    );
    return;
  }

  // 5. Unhandled Server Errors (500)
  console.error(`[Unhandled Server Error] ${req.method} ${req.url}:`, err);

  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected internal server error occurred. Our team has been notified."
      : err.message || "Internal Server Error";

  sendError(
    res,
    message,
    err.status || 500,
    "INTERNAL_SERVER_ERROR",
    process.env.NODE_ENV === "development" ? { stack: err.stack } : undefined
  );
}

