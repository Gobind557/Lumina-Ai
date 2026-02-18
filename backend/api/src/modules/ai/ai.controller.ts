import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../infrastructure/prisma";
import { personalizeEmail, rewriteEmail, scoreEmail } from "./ai.service";
import { ApiError } from "../../shared/errors";

const personalizeSchema = z.object({
  draft_id: z.string().uuid(),
  prospect_id: z.string().uuid(),
  tone: z.string().optional(),
});

const rewriteSchema = z.object({
  draft_id: z.string().uuid(),
  instruction: z.string().min(3),
});

const scoreSchema = z.object({
  draft_id: z.string().uuid(),
});

const feedbackSchema = z.object({
  suggestion_id: z.string().uuid(),
  action: z.enum(["accepted", "rejected", "edited"]),
  feedback: z.string().optional(),
});

export const personalize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = personalizeSchema.parse(req.body);
    const draft = await prisma.emailDraft.findUnique({
      where: { id: payload.draft_id },
    });
    if (!draft) throw new ApiError(404, "NOT_FOUND", "Draft not found");
    const prospect = await prisma.prospect.findUnique({
      where: { id: payload.prospect_id },
    });
    if (!prospect) throw new ApiError(404, "NOT_FOUND", "Prospect not found");

    const result = await personalizeEmail({
      subject: draft.subject,
      body: draft.bodyText ?? draft.bodyHtml ?? "",
      tone: payload.tone,
      prospect: {
        firstName: prospect.firstName,
        lastName: prospect.lastName,
        company: prospect.company,
        jobTitle: prospect.jobTitle,
      },
    });

    return res.json({
      suggestion: {
        subject: draft.subject ?? undefined,
        body: result.body,
        diff: [{ type: "replace", position: 0, text: result.body }],
      },
      confidence: 0.85,
      source_signals: { prospect_match: 0.9, company_match: 0.8, tone_match: 0.95 },
      timestamp: new Date().toISOString(),
      input_hash: "sha256_hash",
    });
  } catch (error) {
    return next(error);
  }
};

export const rewrite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = rewriteSchema.parse(req.body);
    const draft = await prisma.emailDraft.findUnique({
      where: { id: payload.draft_id },
    });
    if (!draft) throw new ApiError(404, "NOT_FOUND", "Draft not found");

    const result = await rewriteEmail({
      subject: draft.subject,
      body: draft.bodyText ?? draft.bodyHtml ?? "",
      instruction: payload.instruction,
    });

    return res.json({
      suggestion: {
        subject: draft.subject ?? undefined,
        body: result.body,
        diff: [{ type: "replace", position: 0, text: result.body }],
      },
      confidence: 0.82,
      source_signals: { prospect_match: 0.7, company_match: 0.6, tone_match: 0.9 },
      timestamp: new Date().toISOString(),
      input_hash: "sha256_hash",
    });
  } catch (error) {
    return next(error);
  }
};

export const score = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = scoreSchema.parse(req.body);
    const draft = await prisma.emailDraft.findUnique({
      where: { id: payload.draft_id },
    });
    if (!draft) throw new ApiError(404, "NOT_FOUND", "Draft not found");

    const result = scoreEmail({
      subject: draft.subject ?? undefined,
      body: draft.bodyText ?? draft.bodyHtml ?? "",
    });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const feedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    feedbackSchema.parse(req.body);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
