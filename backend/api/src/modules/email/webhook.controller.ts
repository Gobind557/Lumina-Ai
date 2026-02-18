import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../infrastructure/prisma";
import { publish } from "../../infrastructure/eventBus";
import { EMAIL_OPENED } from "./email.events";

const openSchema = z.object({
  email_id: z.string().uuid(),
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
