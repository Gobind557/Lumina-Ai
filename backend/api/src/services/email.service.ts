import { prisma } from "../models";
import { ApiError } from "../middleware/error.middleware";

export const getDraftById = async (id: string, userId: string) => {
  const draft = await prisma.emailDraft.findFirst({
    where: { id, userId },
  });
  if (!draft) {
    throw new ApiError(404, "NOT_FOUND", "Draft not found");
  }
  return draft;
};

export const upsertDraft = async (payload: {
  id?: string;
  userId: string;
  workspaceId?: string | null;
  prospectId?: string | null;
  subject?: string | null;
  bodyHtml?: string | null;
  bodyText?: string | null;
}) => {
  const data = {
    userId: payload.userId,
    workspaceId: payload.workspaceId ?? null,
    prospectId: payload.prospectId ?? null,
    subject: payload.subject ?? null,
    bodyHtml: payload.bodyHtml ?? null,
    bodyText: payload.bodyText ?? null,
  };

  if (payload.id) {
    return prisma.emailDraft.update({
      where: { id: payload.id },
      data,
    });
  }

  return prisma.emailDraft.create({ data });
};

export const deleteDraft = async (id: string, userId: string) => {
  const draft = await prisma.emailDraft.findFirst({ where: { id, userId } });
  if (!draft) {
    throw new ApiError(404, "NOT_FOUND", "Draft not found");
  }
  await prisma.emailDraft.delete({ where: { id } });
};

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
  const existing = await prisma.email.findUnique({
    where: { idempotencyKey: payload.idempotencyKey },
  });
  if (existing) return existing;

  return prisma.email.create({
    data: {
      userId: payload.userId,
      workspaceId: payload.workspaceId ?? null,
      prospectId: payload.prospectId ?? null,
      draftId: payload.draftId ?? null,
      fromEmail: payload.fromEmail,
      toEmail: payload.toEmail,
      subject: payload.subject,
      bodyHtml: payload.bodyHtml,
      bodyText: payload.bodyText ?? null,
      status: "PENDING_SEND",
      idempotencyKey: payload.idempotencyKey,
    },
  });
};

export const getEmailById = async (id: string, userId: string) => {
  const email = await prisma.email.findFirst({
    where: { id, userId },
  });
  if (!email) {
    throw new ApiError(404, "NOT_FOUND", "Email not found");
  }
  return email;
};
