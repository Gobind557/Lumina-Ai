/**
 * Domain events for email lifecycle and webhooks.
 */
export const EMAIL_QUEUED = "EMAIL_QUEUED";
export const EMAIL_SENT = "EMAIL_SENT";
export const EMAIL_OPENED = "EMAIL_OPENED";
export const EMAIL_REPLIED = "EMAIL_REPLIED";

export type EmailQueuedPayload = {
  emailId: string;
  userId: string;
  prospectId?: string | null;
  workspaceId?: string | null;
  campaignId?: string | null;
  toEmail: string;
  subject: string;
};

export type EmailSentPayload = {
  emailId: string;
  userId: string;
  prospectId?: string | null;
  campaignId?: string | null;
  providerMessageId: string;
  sentAt: string;
};

export type EmailOpenedPayload = {
  emailId: string;
  openedAt: string;
};

export type EmailRepliedPayload = {
  emailId: string;
  repliedAt: string;
  replySubject?: string | null;
  replyBody?: string | null;
};

export type DomainEvent =
  | { type: typeof EMAIL_QUEUED; payload: EmailQueuedPayload }
  | { type: typeof EMAIL_SENT; payload: EmailSentPayload }
  | { type: typeof EMAIL_OPENED; payload: EmailOpenedPayload }
  | { type: typeof EMAIL_REPLIED; payload: EmailRepliedPayload };

export const EVENT_CHANNEL = "sales-copilot:events";
