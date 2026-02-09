import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../models";

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Missing or invalid token",
        details: {},
        timestamp: new Date().toISOString(),
        request_id: req.requestId,
      },
    });
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

    if (!user) {
      if (env.NODE_ENV === "development") {
        const created = await prisma.user.create({
          data: {
            id: decoded.sub,
            email: decoded.email,
            passwordHash: null,
            role: decoded.role as "admin" | "user",
          },
        });
        req.user = { id: created.id, email: created.email, role: created.role };
        return next();
      }

      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "User not found. Please log in again.",
          details: {},
          timestamp: new Date().toISOString(),
          request_id: req.requestId,
        },
      });
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    return next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
        details: {},
        timestamp: new Date().toISOString(),
        request_id: req.requestId,
      },
    });
  }
};
