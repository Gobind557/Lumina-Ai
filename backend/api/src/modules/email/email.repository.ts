import { prisma } from "../../infrastructure/prisma";
import { ApiError } from "../../shared/errors";

export const emailRepository = {
  getDraftById: async (id: string, userId: string) => {
    const draft = await prisma.emailDraft.findFirst({
      where: { id, userId },
    });
    if (!draft) throw new ApiError(404, "NOT_FOUND", "Draft not found");
    return draft;
  },

  upsertDraft: async (payload: {
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
      return prisma.emailDraft.update({ where: { id: payload.id }, data });
    }
    return prisma.emailDraft.create({ data });
  },

  deleteDraft: async (id: string, userId: string) => {
    const draft = await prisma.emailDraft.findFirst({ where: { id, userId } });
    if (!draft) throw new ApiError(404, "NOT_FOUND", "Draft not found");
    await prisma.emailDraft.delete({ where: { id } });
  },

  createEmailSend: async (payload: {
    userId: string;
    workspaceId?: string | null;
    prospectId?: string | null;
    campaignId?: string | null;
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
        campaignId: payload.campaignId ?? null,
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
  },

  getEmailById: async (id: string, userId: string) => {
    const email = await prisma.email.findFirst({
      where: { id, userId },
    });
    if (!email) throw new ApiError(404, "NOT_FOUND", "Email not found");
    return email;
  },

  findDraft: (draftId: string, userId: string) =>
    prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
    }),

  updateEmailSent: (emailId: string, providerMessageId: string, sentAt: Date) =>
    prisma.email.update({
      where: { id: emailId },
      data: { status: "SENT", providerMessageId, sentAt },
    }),

  updateEmailFailed: (emailId: string) =>
    prisma.email.update({
      where: { id: emailId },
      data: { status: "FAILED" },
    }),

  findEmailById: (id: string) => prisma.email.findUnique({ where: { id } }),
};
