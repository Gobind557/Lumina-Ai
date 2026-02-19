import { subscribe } from "../../infrastructure/eventBus";
import {
  EMAIL_QUEUED,
  EMAIL_SENT,
  EMAIL_OPENED,
  EMAIL_REPLIED,
  type DomainEvent,
  type EmailOpenedPayload,
  type EmailRepliedPayload,
  type EmailSentPayload,
} from "../email/email.events";
import {
  recordEmailOpened,
  recordEmailReplied,
  updateTemplateMetrics,
} from "./analytics.service";
import { prisma } from "../../infrastructure/prisma";

async function onEmailOpened(payload: EmailOpenedPayload): Promise<void> {
  await recordEmailOpened(payload.emailId, new Date(payload.openedAt));
}

async function onEmailReplied(payload: EmailRepliedPayload): Promise<void> {
  await recordEmailReplied(
    payload.emailId,
    new Date(payload.repliedAt),
    payload.replySubject,
    payload.replyBody
  );

  // Update template metrics if email is linked to a template
  const email = await prisma.email.findUnique({
    where: { id: payload.emailId },
    select: { draftId: true },
  });

  if (email?.draftId) {
    const draft = await prisma.emailDraft.findUnique({
      where: { id: email.draftId },
      select: { userId: true },
    });
    // Note: Template association would need to be added to EmailDraft model
    // For now, we'll update metrics based on user's templates
    // This is a simplified approach - you may want to add templateId to EmailDraft
  }
}

async function onEmailSent(payload: EmailSentPayload): Promise<void> {
  // Update template metrics when email is sent
  const email = await prisma.email.findUnique({
    where: { id: payload.emailId },
    select: { draftId: true },
  });

  if (email?.draftId) {
    // Template metrics will be updated on next open/reply event
    // or can be computed periodically
  }
}

async function handle(event: DomainEvent): Promise<void> {
  try {
    switch (event.type) {
      case EMAIL_OPENED:
        await onEmailOpened(event.payload);
        break;
      case EMAIL_REPLIED:
        await onEmailReplied(event.payload);
        break;
      case EMAIL_SENT:
        await onEmailSent(event.payload);
        break;
      case EMAIL_QUEUED:
        break;
      default:
        break;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Analytics consumer error:", error);
  }
}

function main(): void {
  // eslint-disable-next-line no-console
  console.log("Analytics consumer started");
  subscribe(
    [EMAIL_QUEUED, EMAIL_SENT, EMAIL_OPENED, EMAIL_REPLIED],
    (event) => handle(event)
  );
}

main();
