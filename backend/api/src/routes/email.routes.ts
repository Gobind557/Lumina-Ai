import { Router } from "express";
import {
  deleteDraftHandler,
  getDraft,
  sendEmail,
  upsertDraftHandler,
  getEmail,
} from "../controllers/email.controller";

export const emailRoutes = Router();

emailRoutes.get("/drafts/:id", getDraft);
emailRoutes.post("/draft", upsertDraftHandler);
emailRoutes.delete("/draft/:id", deleteDraftHandler);

emailRoutes.post("/send", sendEmail);
emailRoutes.get("/:id", getEmail);
