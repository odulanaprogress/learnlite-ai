import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: Record<string, any>;
  timestamp: string;
}

/**
 * Sends a standardized success JSON response.
 * The frontend can read `res.data.message` directly for user toast/pop notifications.
 */
export function sendSuccess<T = any>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200,
  meta?: Record<string, any>
): Response {
  const body: ApiResponse<T> = {
    success: true,
    statusCode,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(body);
}

/**
 * Sends a standardized error JSON response.
 * The frontend can read `res.data.message` directly for error toast/pop notifications.
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 400,
  errorCode: string = "BAD_REQUEST",
  details?: any
): Response {
  const body: ApiResponse = {
    success: false,
    statusCode,
    message,
    error: {
      code: errorCode,
      message,
      ...(details !== undefined && { details }),
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(body);
}

