import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

export const requestIdMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.requestId = req.headers["x-request-id"]?.toString() || randomUUID();
  next();
};
