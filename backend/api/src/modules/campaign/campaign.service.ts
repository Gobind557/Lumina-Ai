import { prisma } from "../../infrastructure/prisma";
import { ApiError } from "../../shared/errors";
import { getCampaignMetrics } from "../analytics/analytics.service";
import { createEmailSend } from "../email/email.service";
import { enqueueCampaignStep } from "../../infrastructure/queue";
import { getDelayMsForStep } from "./sequence.config";
import { getPrebuiltTemplate } from "./prebuilt-templates";
import { renderTemplate } from "./template-renderer";

/** Resolve templateId for DB: prebuilt keys ("1"-"6") become real Template ids so FK is satisfied. */
async function resolveTemplateIdForStep(
  userId: string,
  templateId: string | null
): Promise<string | null> {
  if (!templateId) return null;
  const prebuilt = getPrebuiltTemplate(templateId);
  if (prebuilt) {
    const marker = `Prebuilt:${templateId}`;
    let template = await prisma.template.findFirst({
      where: { userId, description: marker },
      select: { id: true },
    });
    if (!template) {
      template = await prisma.template.create({
        data: {
          userId,
          title: prebuilt.title,
          description: marker,
          content: prebuilt.content,
          category: "Campaign",
        },
        select: { id: true },
      });
    }
    return template.id;
  }
  return templateId;
}

export const getCampaignById = async (id: string, userId: string) => {
  const campaign = await prisma.campaign.findFirst({
    where: { id, userId },
    include: {
      emails: {
        select: {
          id: true,
          status: true,
          sentAt: true,
          subject: true,
          toEmail: true,
        },
        orderBy: { sentAt: "desc" },
      },
      steps: {
        orderBy: { stepNumber: "asc" },
        include: { template: { select: { id: true, title: true } } },
      },
    },
  });
  if (!campaign) throw new ApiError(404, "NOT_FOUND", "Campaign not found");
  return campaign;
};

export type CampaignStepInput = {
  stepNumber: number;
  templateId: string | null;
  delayDays: number;
  subjectOverride?: string | null;
  contentOverride?: string | null;
};

export const getCampaignSteps = async (campaignId: string, userId: string) => {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, userId },
    select: { id: true },
  });
  if (!campaign) throw new ApiError(404, "NOT_FOUND", "Campaign not found");
  return prisma.campaignStep.findMany({
    where: { campaignId },
    include: { template: { select: { id: true, title: true, content: true } } },
    orderBy: { stepNumber: "asc" },
  });
};

export const upsertCampaignSteps = async (
  campaignId: string,
  userId: string,
  steps: CampaignStepInput[]
) => {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, userId },
    select: { id: true, status: true },
  });
  if (!campaign) throw new ApiError(404, "NOT_FOUND", "Campaign not found");
  if (campaign.status !== "DRAFT") {
    throw new ApiError(400, "BAD_REQUEST", "Can only edit steps for draft campaigns");
  }
  await prisma.campaignStep.deleteMany({ where: { campaignId } });
  if (steps.length) {
    const resolved = await Promise.all(
      steps.map(async (s) => ({
        campaignId,
        stepNumber: s.stepNumber,
        templateId: await resolveTemplateIdForStep(userId, s.templateId || null),
        delayDays: s.delayDays,
        subjectOverride: s.subjectOverride ?? null,
        contentOverride: s.contentOverride ?? null,
      }))
    );
    await prisma.campaignStep.createMany({
      data: resolved,
    });
  }
  return getCampaignSteps(campaignId, userId);
};

/** Minimum delay between steps (1 min) when user sets 0 days, so two steps don't send in the same second. */
const MIN_STEP_DELAY_MS = 60 * 1000;

/** Returns delay in ms for a step. Uses CampaignStep if present, else fallback to sequence.config. */
export async function getDelayMsForCampaignStep(
  campaignId: string,
  stepNumber: number
): Promise<number> {
  const step = await prisma.campaignStep.findUnique({
    where: { campaignId_stepNumber: { campaignId, stepNumber } },
  });
  const rawMs = step
    ? step.delayDays * 24 * 60 * 60 * 1000
    : (getDelayMsForStep(stepNumber) ?? 0);
  return rawMs > 0 ? rawMs : MIN_STEP_DELAY_MS;
}

/** Returns max step number for a campaign. Uses CampaignStep count if present, else sequence.config */
export async function getCampaignMaxStep(campaignId: string): Promise<number> {
  const count = await prisma.campaignStep.count({ where: { campaignId } });
  if (count > 0) return count;
  const { SEQUENCE_MAX_STEP } = await import("./sequence.config");
  return SEQUENCE_MAX_STEP;
}

export const listCampaigns = async (params: {
  userId: string;
  workspaceId?: string;
  status?: string;
  limit: number;
  offset: number;
}) => {
  const where: any = { userId: params.userId };
  if (params.workspaceId) where.workspaceId = params.workspaceId;
  if (params.status) where.status = params.status;

  const [total, campaigns] = await Promise.all([
    prisma.campaign.count({ where }),
    prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: params.limit,
      skip: params.offset,
      include: { _count: { select: { emails: true } } },
    }),
  ]);

  return { total, campaigns };
};

const CAMPAIGN_STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"] as const;
export type CampaignStatusType = (typeof CAMPAIGN_STATUSES)[number];

export const createCampaign = async (payload: {
  userId: string;
  workspaceId?: string | null;
  name: string;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  prospectIds?: string[];
  status?: CampaignStatusType;
  steps?: CampaignStepInput[];
}) => {
  const status = payload.status && CAMPAIGN_STATUSES.includes(payload.status)
    ? payload.status
    : "DRAFT";
  const campaign = await prisma.campaign.create({
    data: {
      userId: payload.userId,
      workspaceId: payload.workspaceId ?? null,
      name: payload.name,
      description: payload.description ?? null,
      status,
      startDate: payload.startDate ?? null,
      endDate: payload.endDate ?? null,
    },
  });
  if (payload.steps?.length) {
    const resolved = await Promise.all(
      payload.steps.map(async (s) => ({
        campaignId: campaign.id,
        stepNumber: s.stepNumber,
        templateId: await resolveTemplateIdForStep(payload.userId, s.templateId || null),
        delayDays: s.delayDays,
        subjectOverride: s.subjectOverride ?? null,
        contentOverride: s.contentOverride ?? null,
      }))
    );
    await prisma.campaignStep.createMany({
      data: resolved,
    });
  }
  if (payload.prospectIds?.length) {
    await prisma.campaignProspect.createMany({
      data: payload.prospectIds.map((prospectId) => ({
        campaignId: campaign.id,
        prospectId,
        status: "ACTIVE",
        currentStep: 0,
      })),
      skipDuplicates: true,
    });

    // If campaign starts as ACTIVE, immediately schedule step 1 for all prospects
    if (status === "ACTIVE") {
      const delayMs = await getDelayMsForCampaignStep(campaign.id, 1);
      await Promise.all(
        payload.prospectIds.map((prospectId) =>
          enqueueCampaignStep(
            {
              campaignId: campaign.id,
              prospectId,
              userId: payload.userId,
              stepNumber: 1,
            },
            delayMs,
          ),
        ),
      );
    }
  }
  return prisma.campaign.findFirst({
    where: { id: campaign.id, userId: payload.userId },
    include: { steps: { orderBy: { stepNumber: "asc" } } },
  }) as Promise<typeof campaign & { steps: unknown[] }>;
};

export const updateCampaignStatus = async (
  id: string,
  userId: string,
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED"
) => {
  const campaign = await prisma.campaign.findFirst({ where: { id, userId } });
  if (!campaign) throw new ApiError(404, "NOT_FOUND", "Campaign not found");

  const updated = await prisma.campaign.update({
    where: { id },
    data: { status },
  });

  // When transitioning into ACTIVE, schedule step 1 for prospects that haven't started yet
  if (campaign.status !== "ACTIVE" && status === "ACTIVE") {
    const prospects = await prisma.campaignProspect.findMany({
      where: {
        campaignId: id,
        status: "ACTIVE",
        currentStep: 0,
      },
      select: { prospectId: true },
    });

    if (prospects.length) {
      const delayMs = await getDelayMsForCampaignStep(id, 1);
      await Promise.all(
        prospects.map((cp) =>
          enqueueCampaignStep(
            {
              campaignId: id,
              prospectId: cp.prospectId,
              userId,
              stepNumber: 1,
            },
            delayMs,
          ),
        ),
      );
    }
  }

  return updated;
};

export const deleteCampaign = async (id: string, userId: string) => {
  const campaign = await prisma.campaign.findFirst({ where: { id, userId } });
  if (!campaign) throw new ApiError(404, "NOT_FOUND", "Campaign not found");
  await prisma.campaign.delete({ where: { id } });
};

/** Count prospects who opened at least one email in this campaign but have not replied (for What Needs Attention). */
export const getCampaignOpenedNoReplyCount = async (campaignId: string): Promise<number> => {
  const opens = await prisma.emailOpenEvent.findMany({
    where: { email: { campaignId } },
    select: { email: { select: { prospectId: true } } },
  });
  const prospectIds = [...new Set(opens.map((o) => o.email.prospectId).filter(Boolean))] as string[];
  if (prospectIds.length === 0) return 0;
  const notReplied = await prisma.campaignProspect.count({
    where: {
      campaignId,
      prospectId: { in: prospectIds },
      status: { not: "REPLIED" },
    },
  });
  return notReplied;
};

/** Open rate per step (step number -> open rate %). Derived from campaign emails' idempotencyKey (step N). */
export const getCampaignMetricsPerStep = async (
  campaignId: string
): Promise<Array<{ stepNumber: number; openRate: number }>> => {
  const emails = await prisma.email.findMany({
    where: { campaignId, status: "SENT" },
    select: { id: true, idempotencyKey: true },
  });
  const byStep = new Map<number, string[]>();
  for (const e of emails) {
    const match = e.idempotencyKey.match(/-step-(\d+)$/);
    const stepNum = match ? parseInt(match[1], 10) : 1;
    const ids = byStep.get(stepNum) ?? [];
    ids.push(e.id);
    byStep.set(stepNum, ids);
  }
  const result: Array<{ stepNumber: number; openRate: number }> = [];
  for (const [stepNumber, emailIds] of byStep.entries()) {
    const opens = await prisma.emailOpenEvent.count({
      where: { emailId: { in: emailIds } },
    });
    const openRate = emailIds.length > 0 ? Math.round((opens / emailIds.length) * 100) : 0;
    result.push({ stepNumber, openRate });
  }
  result.sort((a, b) => a.stepNumber - b.stepNumber);
  return result;
};

export const getCampaignWithMetrics = async (id: string, userId: string) => {
  const campaign = await getCampaignById(id, userId);
  const metrics = await getCampaignMetrics(id);
  const openedNoReplyCount = await getCampaignOpenedNoReplyCount(id);
  const stepMetrics = await getCampaignMetricsPerStep(id);
  return { ...campaign, metrics, attention: { openedNoReplyCount }, stepMetrics };
};

export type CampaignActivityItem = {
  type: "email_opened" | "reply";
  timestamp: string;
  description?: string;
  prospectName?: string;
};

export const getCampaignActivities = async (
  campaignId: string,
  userId: string,
  limit = 50
): Promise<CampaignActivityItem[]> => {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, userId },
    select: { id: true },
  });
  if (!campaign) throw new ApiError(404, "NOT_FOUND", "Campaign not found");

  const [opens, replies] = await Promise.all([
    prisma.emailOpenEvent.findMany({
      where: { email: { campaignId, userId } },
      include: {
        email: {
          select: {
            id: true,
            prospectId: true,
            toEmail: true,
            subject: true,
            prospect: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
      orderBy: { openedAt: "desc" },
      take: limit * 3,
    }),
    prisma.emailReplyEvent.findMany({
      where: { email: { campaignId, userId } },
      include: {
        email: {
          select: {
            toEmail: true,
            subject: true,
            prospect: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
      orderBy: { repliedAt: "desc" },
      take: limit,
    }),
  ]);

  // One "Email opened" per email (most recent open per email), so Step 1 and Step 2 opens both show
  const seenEmailIds = new Set<string>();
  const openItems: CampaignActivityItem[] = [];
  for (const o of opens) {
    if (seenEmailIds.has(o.email.id)) continue;
    seenEmailIds.add(o.email.id);
    const name =
      o.email.prospect &&
      [o.email.prospect.firstName, o.email.prospect.lastName].filter(Boolean).join(" ");
    openItems.push({
      type: "email_opened",
      timestamp: o.openedAt.toISOString(),
      description: o.email.subject ? `Opened: ${o.email.subject}` : undefined,
      prospectName: (name && name.trim()) || o.email.toEmail || undefined,
    });
  }

  const replyItems: CampaignActivityItem[] = replies.map((r) => {
    const name =
      r.email.prospect &&
      [r.email.prospect.firstName, r.email.prospect.lastName].filter(Boolean).join(" ");
    return {
      type: "reply" as const,
      timestamp: r.repliedAt.toISOString(),
      description: r.replySubject ? `Replied: ${r.replySubject}` : "Replied",
      prospectName: (name && name.trim()) || r.email.toEmail || undefined,
    };
  });

  const items = [...openItems, ...replyItems];
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return items.slice(0, limit);
};

export const getCampaignProspects = async (campaignId: string, userId: string) => {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, userId },
    select: { id: true },
  });
  if (!campaign) throw new ApiError(404, "NOT_FOUND", "Campaign not found");

  const rows = await prisma.campaignProspect.findMany({
    where: { campaignId },
    include: {
      prospect: {
        select: { id: true, firstName: true, lastName: true, email: true, company: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((row) => ({
    prospectId: row.prospectId,
    name: [row.prospect.firstName, row.prospect.lastName].filter(Boolean).join(" ") || row.prospect.email,
    email: row.prospect.email,
    company: row.prospect.company ?? "",
    status: row.status,
    currentStep: row.currentStep,
  }));
};

/**
 * Execute a scheduled campaign step: create and enqueue the next sequence email.
 * Uses CampaignStep + Template when configured; falls back to placeholder content.
 */
export const executeCampaignStep = async (payload: {
  campaignId: string;
  prospectId: string;
  userId: string;
  stepNumber: number;
}) => {
  const [campaign, prospect, user, stepRow] = await Promise.all([
    prisma.campaign.findFirst({
      where: { id: payload.campaignId, userId: payload.userId },
      select: { id: true, workspaceId: true, status: true },
    }),
    prisma.prospect.findUnique({
      where: { id: payload.prospectId },
      select: { email: true, firstName: true, lastName: true, company: true },
    }),
    prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true },
    }),
    prisma.campaignStep.findUnique({
      where: { campaignId_stepNumber: { campaignId: payload.campaignId, stepNumber: payload.stepNumber } },
      include: { template: true },
    }),
  ]);

  if (!campaign || campaign.status !== "ACTIVE") return;
  if (!prospect || !user?.email) return;

  const vars = {
    firstName: prospect.firstName,
    lastName: prospect.lastName,
    company: prospect.company,
    email: prospect.email,
  };

  type StepWithOverrides = typeof stepRow & {
    subjectOverride?: string | null;
    contentOverride?: string | null;
  };
  const step = stepRow as StepWithOverrides | null;

  let subject: string;
  let bodyHtml: string;
  let bodyText: string;

  if (step?.subjectOverride != null || step?.contentOverride != null) {
    subject =
      step.subjectOverride != null
        ? renderTemplate(step.subjectOverride, vars)
        : step?.template
          ? renderTemplate(step.template.title, vars)
          : `Follow-up (Step ${payload.stepNumber})`;
    const content =
      step.contentOverride ??
      step?.template?.content ??
      (step?.templateId ? getPrebuiltTemplate(step.templateId)?.content : null);
    const rawBody = content ?? "";
    bodyHtml = renderTemplate(rawBody, vars);
    bodyText = renderTemplate(
      rawBody.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      vars
    );
  } else if (step?.template) {
    const t = step.template;
    subject = renderTemplate(t.title, vars);
    bodyHtml = renderTemplate(t.content, vars);
    bodyText = renderTemplate(
      t.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      vars
    );
  } else {
    const prebuilt = getPrebuiltTemplate(step?.templateId ?? null);
    if (prebuilt) {
      subject = renderTemplate(prebuilt.title, vars);
      bodyHtml = renderTemplate(prebuilt.content, vars);
      bodyText = renderTemplate(
        prebuilt.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
        vars
      );
    } else {
      subject = `Follow-up (Step ${payload.stepNumber})`;
      bodyHtml = `<p>Follow-up step ${payload.stepNumber}.</p>`;
      bodyText = `Follow-up step ${payload.stepNumber}.`;
    }
  }

  const idempotencyKey = `${payload.campaignId}-${payload.prospectId}-step-${payload.stepNumber}`;

  await createEmailSend({
    userId: payload.userId,
    workspaceId: campaign.workspaceId ?? undefined,
    prospectId: payload.prospectId,
    campaignId: payload.campaignId,
    fromEmail: user.email,
    toEmail: prospect.email,
    subject,
    bodyHtml,
    bodyText,
    idempotencyKey,
  });
};
