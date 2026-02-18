import { emailRepository } from "./email.repository";
import { enqueueEmailSend } from "../../infrastructure/queue";
import { publish } from "../../infrastructure/eventBus";
import { EMAIL_QUEUED } from "./email.events";

export const getDraftById = (id: string, userId: string) =>
  emailRepository.getDraftById(id, userId);

export const upsertDraft = (payload: {
  id?: string;
  userId: string;
  workspaceId?: string | null;
  prospectId?: string | null;
  subject?: string | null;
  bodyHtml?: string | null;
  bodyText?: string | null;
}) => emailRepository.upsertDraft(payload);

export const deleteDraft = (id: string, userId: string) =>
  emailRepository.deleteDraft(id, userId);

export const createEmailSend = async (payload: {
  userId: string;
  workspaceId?: string | null;
  prospectId?: string | null;
  draftId?: string | null;
  fromEmail: string;
  toEmail: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string | null;
  idempotencyKey: string;
}) => {
  const email = await emailRepository.createEmailSend(payload);
  await enqueueEmailSend(email.id);
  await publish(EMAIL_QUEUED, {
    emailId: email.id,
    userId: email.userId,
    prospectId: email.prospectId ?? undefined,
    workspaceId: email.workspaceId ?? undefined,
    toEmail: email.toEmail,
    subject: email.subject,
  });
  return email;
};

export const getEmailById = (id: string, userId: string) =>
  emailRepository.getEmailById(id, userId);
