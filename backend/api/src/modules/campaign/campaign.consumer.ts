import { subscribe } from "../../infrastructure/eventBus";
import {
  EMAIL_QUEUED,
  EMAIL_SENT,
  EMAIL_OPENED,
  EMAIL_REPLIED,
  type DomainEvent,
  type EmailQueuedPayload,
  type EmailSentPayload,
  type EmailOpenedPayload,
  type EmailRepliedPayload,
} from "../email/email.events";
import { prisma } from "../../infrastructure/prisma";
import { updateCampaignStatus } from "./campaign.service";

/**
 * Campaign engine consumer: reacts to email lifecycle events and progresses campaign state.
 * Implements campaign progression logic:
 * - EMAIL_SENT: Activates campaign if first email sent
 * - EMAIL_OPENED: Tracks engagement, may trigger follow-up sequences
 * - EMAIL_REPLIED: Marks prospect as engaged, may advance to next sequence step
 */
async function onEmailQueued(payload: EmailQueuedPayload): Promise<void> {
  if (!payload.campaignId) return;

  // Ensure campaign exists and is in valid state
  const campaign = await prisma.campaign.findUnique({
    where: { id: payload.campaignId },
  });

  if (!campaign) return;

  // Auto-activate campaign when first email is queued (if still DRAFT)
  if (campaign.status === "DRAFT") {
    await updateCampaignStatus(payload.campaignId, payload.userId, "ACTIVE");
  }
}

async function onEmailSent(payload: EmailSentPayload): Promise<void> {
  if (!payload.campaignId) return;

  const campaign = await prisma.campaign.findUnique({
    where: { id: payload.campaignId },
  });

  if (!campaign) return;

  // Ensure campaign is ACTIVE when emails are being sent
  if (campaign.status === "DRAFT") {
    await updateCampaignStatus(payload.campaignId, payload.userId, "ACTIVE");
  }

  // Check if campaign should be marked as COMPLETED
  // (e.g., all emails in sequence sent, or end date reached)
  if (campaign.endDate && new Date() >= campaign.endDate) {
    await updateCampaignStatus(payload.campaignId, payload.userId, "COMPLETED");
  }
}

async function onEmailOpened(payload: EmailOpenedPayload): Promise<void> {
  // Track engagement for campaign progression
  // Future: Could trigger follow-up emails or advance sequence step
  // For now, this is tracked via analytics consumer
}

async function onEmailReplied(payload: EmailRepliedPayload): Promise<void> {
  const email = await prisma.email.findUnique({
    where: { id: payload.emailId },
    select: { campaignId: true, prospectId: true },
  });

  if (!email?.campaignId || !email?.prospectId) return;

  await prisma.campaignProspect.updateMany({
    where: {
      campaignId: email.campaignId,
      prospectId: email.prospectId,
    },
    data: { status: "REPLIED" },
  });
}

async function handle(event: DomainEvent): Promise<void> {
  try {
    switch (event.type) {
      case EMAIL_QUEUED:
        await onEmailQueued(event.payload);
        break;
      case EMAIL_SENT:
        await onEmailSent(event.payload);
        break;
      case EMAIL_OPENED:
        await onEmailOpened(event.payload);
        break;
      case EMAIL_REPLIED:
        await onEmailReplied(event.payload);
        break;
      default:
        break;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Campaign consumer error:", error);
  }
}

function main(): void {
  // eslint-disable-next-line no-console
  console.log("Campaign engine consumer started");
  subscribe(
    [EMAIL_QUEUED, EMAIL_SENT, EMAIL_OPENED, EMAIL_REPLIED],
    (event) => handle(event)
  );
}

main();
