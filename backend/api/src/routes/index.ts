import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { emailRoutes } from "./email.routes";
import { aiRoutes } from "./ai.routes";
import { prospectRoutes } from "./prospect.routes";
import { authMiddleware } from "../middleware/auth.middleware";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/emails", authMiddleware, emailRoutes);
routes.use("/ai", authMiddleware, aiRoutes);
routes.use("/prospects", authMiddleware, prospectRoutes);
