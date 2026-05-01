import { Router } from "express";
import { personalize, rewrite, rewriteText, score, feedback } from "./ai.controller";

export const aiRoutes = Router();

aiRoutes.post("/personalize", personalize);
aiRoutes.post("/rewrite", rewrite);
aiRoutes.post("/rewrite-text", rewriteText);
aiRoutes.post("/score", score);
aiRoutes.post("/feedback", feedback);
