import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { emailRoutes } from "../modules/email/email.routes";
import { aiRoutes } from "../modules/ai/ai.routes";
import { prospectRoutes } from "../modules/prospect/prospect.routes";
import { templateRoutes } from "../modules/template/template.routes";
import { dashboardRoutes } from "../modules/dashboard/dashboard.routes";
import { campaignRoutes } from "../modules/campaign/campaign.routes";
import {
  emailOpenWebhook,
  emailReplyWebhook,
  emailOpenPixel,
} from "../modules/email/webhook.controller";
import { authMiddleware } from "../shared/middleware/auth.middleware";

export const routes = Router();

routes.use("/auth", authRoutes);
const webhookRouter = Router();
webhookRouter.post("/email/open", emailOpenWebhook);
webhookRouter.get("/email/open-pixel", emailOpenPixel);
webhookRouter.post("/email/reply", emailReplyWebhook);
routes.use("/webhooks", webhookRouter);
routes.use("/emails", authMiddleware, emailRoutes);
routes.use("/ai", authMiddleware, aiRoutes);
routes.use("/prospects", authMiddleware, prospectRoutes);
routes.use("/templates", authMiddleware, templateRoutes);
routes.use("/campaigns", campaignRoutes);
routes.use("/dashboard", dashboardRoutes);
