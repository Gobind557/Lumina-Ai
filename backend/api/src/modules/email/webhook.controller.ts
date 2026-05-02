import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../infrastructure/prisma";
import { emailRepository } from "./email.repository";
import { publish } from "../../infrastructure/eventBus";
import { EMAIL_OPENED, EMAIL_REPLIED } from "./email.events";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

export const emailOpenPixel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const querySchema = z.object({
      email_id: z.string().uuid(),
    });

    const payload = querySchema.parse(req.query);

    const email = await prisma.email.findUnique({
      where: { id: payload.email_id },
    });

    // We record opens via our own tracking pixel, regardless of which ESP
    // (e.g. Mailgun via SMTP) is used behind the scenes.
    if (email) {
      const openedAt = new Date();
      await publish(EMAIL_OPENED, {
        emailId: payload.email_id,
        openedAt: openedAt.toISOString(),
      });
    }

    const pixelBuffer = Buffer.from(
      "R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
      "base64"
    );

    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Content-Length", pixelBuffer.length.toString());

    return res.status(200).end(pixelBuffer);
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

/** Brevo transactional webhook payload (subset we use). */
const brevoWebhookSchema = z.object({
  event: z.string(),
  "message-id": z.string().optional(),
  messageId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  ts_epoch: z.number().optional(),
  ts_event: z.number().optional(),
  email: z.string().optional(),
});

/**
 * Brevo sends open (and other) events to the Notify URL you configure in their dashboard.
 * Configure: Notify URL = https://your-api/api/webhooks/brevo (note /api prefix)
 * Subscribe to: Opened, First opening (unique_opened).
 * We resolve our emailId from tags (we send tags: [emailId]) or from providerMessageId.
 */
export const brevoWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // eslint-disable-next-line no-console
  console.log("[Brevo webhook] POST received");
  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        // eslint-disable-next-line no-console
        console.warn("[Brevo webhook] Body is string but not valid JSON");
        return res.status(400).json({ error: "Invalid payload" });
      }
    }

    const payload = brevoWebhookSchema.safeParse(body);
    if (!payload.success) {
      // eslint-disable-next-line no-console
      console.warn("[Brevo webhook] Invalid payload", JSON.stringify(body).slice(0, 500));
      return res.status(400).json({ error: "Invalid payload" });
    }

    const msgId = payload.data["message-id"] ?? payload.data.messageId;
    const { event, tags, ts_epoch, ts_event, email: recipientEmail } = payload.data;

    // eslint-disable-next-line no-console
    console.log("[Brevo webhook] Received", { event, messageId: msgId, tags });

    // Brevo fires BOTH "opened" (every open) and "unique_opened" (first open).
    // We only process unique opens to avoid duplicate records in analytics.
    const uniqueOpenEvents = ["unique_opened", "uniqueOpened"];
    if (!uniqueOpenEvents.includes(event)) {
      // eslint-disable-next-line no-console
      console.log("[Brevo webhook] Ignoring non-unique event:", event);
      return res.status(200).json({ accepted: true });
    }

    let emailId: string | null = null;
    if (tags?.length) {
      const uuidTag = tags.find((t) => UUID_REGEX.test(t));
      if (uuidTag) emailId = uuidTag;
    }
    for (const mid of [msgId, msgId?.replace(/^<|>$/g, "").trim(), msgId ? `<${msgId}>` : null].filter(Boolean) as string[]) {
      if (!emailId && mid) {
        const row = await emailRepository.findEmailByProviderMessageId(mid);
        if (row) {
          emailId = row.id;
          break;
        }
      }
    }
    if (!emailId && recipientEmail) {
      const recent = await prisma.email.findFirst({
        where: { toEmail: recipientEmail, status: "SENT" },
        orderBy: { sentAt: "desc" },
        select: { id: true },
      });
      if (recent) emailId = recent.id;
    }
    if (!emailId) {
      // eslint-disable-next-line no-console
      console.warn("[Brevo webhook] Open event but could not resolve emailId", {
        event,
        messageId: msgId,
        tags,
        recipientEmail,
      });
      return res.status(200).json({ accepted: true });
    }

    const openedAt =
      ts_epoch != null
        ? new Date(ts_epoch > 1e12 ? ts_epoch : ts_epoch * 1000)
        : ts_event != null
          ? new Date(ts_event * 1000)
          : new Date();

    await publish(EMAIL_OPENED, {
      emailId,
      openedAt: openedAt.toISOString(),
    });

    // eslint-disable-next-line no-console
    console.log("[Brevo webhook] Recorded open for emailId", emailId);
    return res.status(200).json({ accepted: true });
  } catch (error) {
    return next(error);
  }
};
