export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = "INTERNAL_SERVER_ERROR",
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);
    if (typeof (Error as any).captureStackTrace === "function") {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required or credentials invalid.", details?: any) {
    super(message, 401, "AUTHENTICATION_ERROR", details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "You do not have permission to perform this action.", details?: any) {
    super(message, 403, "FORBIDDEN", details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "The requested resource was not found.", details?: any) {
    super(message, 404, "NOT_FOUND", details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict detected.", details?: any) {
    super(message, 409, "RESOURCE_CONFLICT", details);
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message: string = "Uploaded payload exceeds the maximum allowed limit.", details?: any) {
    super(message, 413, "PAYLOAD_TOO_LARGE", details);
  }
}

export class AIServiceError extends AppError {
  constructor(
    message: string = "AI Service is temporarily unavailable or encountered an error.",
    details?: any
  ) {
    super(message, 502, "AI_SERVICE_ERROR", details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests. Please slow down.", details?: any) {
    super(message, 429, "TOO_MANY_REQUESTS", details);
  }
}

