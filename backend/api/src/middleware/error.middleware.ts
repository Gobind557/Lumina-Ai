import { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const errorMiddleware = (
  err: ApiError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err instanceof ApiError ? err.status : 500;
  const code = err instanceof ApiError ? err.code : "INTERNAL_ERROR";
  const details = err instanceof ApiError ? err.details ?? {} : {};

  return res.status(status).json({
    error: {
      code,
      message: err.message || "Unexpected error",
      details,
      timestamp: new Date().toISOString(),
      request_id: req.requestId,
    },
  });
};
