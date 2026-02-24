import { Router } from "express";
import {
  list,
  getById,
  create,
  updateStatus,
} from "./campaign.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

export const campaignRoutes = Router();

campaignRoutes.use(authMiddleware);
campaignRoutes.get("/", list);
campaignRoutes.get("/:id", getById);
campaignRoutes.post("/", create);
campaignRoutes.patch("/:id/status", updateStatus);
