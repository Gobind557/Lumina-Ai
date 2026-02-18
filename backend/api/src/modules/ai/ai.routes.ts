import { Router } from "express";
import { personalize, rewrite, score, feedback } from "./ai.controller";

export const aiRoutes = Router();

aiRoutes.post("/personalize", personalize);
aiRoutes.post("/rewrite", rewrite);
aiRoutes.post("/score", score);
aiRoutes.post("/feedback", feedback);
