import { Request, Response, NextFunction } from "express";
import {
  getDashboardStats,
  getDashboardTimeline,
  getDashboardMomentum,
  getDashboardCampaigns,
} from "./dashboard.service";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const stats = await getDashboardStats(userId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getTimeline = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const days = req.query.days ? parseInt(String(req.query.days)) : 7;
    const timeline = await getDashboardTimeline(userId, days);
    res.json(timeline);
  } catch (error) {
    next(error);
  }
};

export const getMomentum = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const momentum = await getDashboardMomentum(userId);
    res.json(momentum);
  } catch (error) {
    next(error);
  }
};

export const getCampaigns = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const campaigns = await getDashboardCampaigns(userId);
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
};
