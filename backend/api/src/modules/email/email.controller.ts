/// <reference path="../../shared/types/express.d.ts" />
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getDraftById,
  upsertDraft,
  deleteDraft,
  createEmailSend,
  getEmailById,
} from "./email.service";
import { emailRepository } from "./email.repository";

const upsertDraftSchema = z.object({
  id: z.string().uuid().optional(),
  prospect_id: z.string().uuid(),
  subject: z.string().optional().nullable(),
  body_html: z.string().optional().nullable(),
  body_text: z.string().optional().nullable(),
});

const sendSchema = z.object({
  draft_id: z.string().uuid(),
  idempotency_key: z.string().uuid(),
  from_email: z.string().email(),
  to_email: z.string().email(),
});

export const getDraft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const draft = await getDraftById(String(req.params.id), userId);
    return res.json({
      id: String(draft.id),
      user_id: draft.userId,
      workspace_id: draft.workspaceId,
      prospect_id: draft.prospectId,
      subject: draft.subject,
      body_html: draft.bodyHtml,
      body_text: draft.bodyText,
      created_at: draft.createdAt,
      updated_at: draft.updatedAt,
    });
  } catch (error) {
    return next(error);
  }
};

export const upsertDraftHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = upsertDraftSchema.parse(req.body);
    const draft = await upsertDraft({
      id: payload.id,
      userId: (req.user?.id ?? "") as string,
      prospectId: payload.prospect_id,
      subject: payload.subject ?? null,
      bodyHtml: payload.body_html ?? null,
      bodyText: payload.body_text ?? null,
    });

    return res.json({ id: String(draft.id), updated_at: draft.updatedAt });
  } catch (error) {
    return next(error);
  }
};

export const deleteDraftHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteDraft(String(req.params.id), (req.user?.id ?? "") as string);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = sendSchema.parse(req.body);
    const draft = await emailRepository.findDraft(payload.draft_id, (req.user?.id ?? "") as string);
    if (!draft) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Draft not found",
          details: {},
          timestamp: new Date().toISOString(),
          request_id: req.requestId,
        },
      });
    }

    const email = await createEmailSend({
      userId: (req.user?.id ?? "") as string,
      workspaceId: draft.workspaceId,
      prospectId: draft.prospectId,
      draftId: draft.id,
      fromEmail: payload.from_email,
      toEmail: payload.to_email,
      subject: draft.subject ?? "",
      bodyHtml: draft.bodyHtml ?? "",
      bodyText: draft.bodyText ?? undefined,
      idempotencyKey: payload.idempotency_key,
    });

    return res.status(201).json({
      id: String(email.id),
      status: email.status,
      created_at: email.createdAt,
    });
  } catch (error) {
    return next(error);
  }
};

export const getEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = await getEmailById(String(req.params.id), (req.user?.id ?? "") as string);
    return res.json({
      id: email.id,
      draft_id: email.draftId,
      user_id: email.userId,
      workspace_id: email.workspaceId,
      prospect_id: email.prospectId,
      from_email: email.fromEmail,
      to_email: email.toEmail,
      subject: email.subject,
      body_html: email.bodyHtml,
      body_text: email.bodyText,
      status: email.status,
      provider_message_id: email.providerMessageId,
      sent_at: email.sentAt,
      created_at: email.createdAt,
      updated_at: email.updatedAt,
    });
  } catch (error) {
    return next(error);
  }
};
