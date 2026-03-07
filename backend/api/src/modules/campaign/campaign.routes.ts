import { Router } from "express";
import {
  list,
  getById,
  create,
  updateStatus,
  remove,
  getProspects,
  getSteps,
  upsertSteps,
  getActivities,
} from "./campaign.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

export const campaignRoutes = Router();

campaignRoutes.use(authMiddleware);
campaignRoutes.get("/", list);
campaignRoutes.get("/:id/prospects", getProspects);
campaignRoutes.get("/:id/steps", getSteps);
campaignRoutes.get("/:id/activities", getActivities);
campaignRoutes.put("/:id/steps", upsertSteps);
campaignRoutes.get("/:id", getById);
campaignRoutes.post("/", create);
campaignRoutes.patch("/:id/status", updateStatus);
campaignRoutes.delete("/:id", remove);
