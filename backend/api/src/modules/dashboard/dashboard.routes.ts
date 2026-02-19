import { Router } from "express";
import {
  getStats,
  getTimeline,
  getMomentum,
  getCampaigns,
} from "./dashboard.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

export const dashboardRoutes = Router();

dashboardRoutes.use(authMiddleware);
dashboardRoutes.get("/stats", getStats);
dashboardRoutes.get("/timeline", getTimeline);
dashboardRoutes.get("/momentum", getMomentum);
dashboardRoutes.get("/campaigns", getCampaigns);
