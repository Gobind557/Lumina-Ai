import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../infrastructure/prisma";
import { publish } from "../../infrastructure/eventBus";
import { EMAIL_OPENED, EMAIL_REPLIED } from "./email.events";

const openSchema = z.object({
  email_id: z.string().uuid(),
});

const replySchema = z.object({
  email_id: z.string().uuid(),
  reply_subject: z.string().optional(),
  reply_body: z.string().optional(),
});

export const emailOpenWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = openSchema.parse(req.body);
    const email = await prisma.email.findUnique({
      where: { id: payload.email_id },
    });
    if (!email) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Email not found", details: {} },
      });
    }

    const openedAt = new Date();
    await publish(EMAIL_OPENED, {
      emailId: payload.email_id,
      openedAt: openedAt.toISOString(),
    });

    return res.status(202).json({ accepted: true, opened_at: openedAt.toISOString() });
  } catch (error) {
    return next(error);
  }
};

export const emailReplyWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = replySchema.parse(req.body);
    const email = await prisma.email.findUnique({
      where: { id: payload.email_id },
    });
    if (!email) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Email not found", details: {} },
      });
    }

    const repliedAt = new Date();
    await publish(EMAIL_REPLIED, {
      emailId: payload.email_id,
      repliedAt: repliedAt.toISOString(),
      replySubject: payload.reply_subject ?? null,
      replyBody: payload.reply_body ?? null,
    });

    return res.status(202).json({ accepted: true, replied_at: repliedAt.toISOString() });
  } catch (error) {
    return next(error);
  }
};
