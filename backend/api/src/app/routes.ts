import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { emailRoutes } from "../modules/email/email.routes";
import { aiRoutes } from "../modules/ai/ai.routes";
import { prospectRoutes } from "../modules/prospect/prospect.routes";
import { templateRoutes } from "../modules/template/template.routes";
import { emailOpenWebhook } from "../modules/email/webhook.controller";
import { authMiddleware } from "../shared/middleware/auth.middleware";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/webhooks", Router().post("/email/open", emailOpenWebhook));
routes.use("/emails", authMiddleware, emailRoutes);
routes.use("/ai", authMiddleware, aiRoutes);
routes.use("/prospects", authMiddleware, prospectRoutes);
routes.use("/templates", authMiddleware, templateRoutes);
