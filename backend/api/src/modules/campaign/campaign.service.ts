import { prisma } from "../../infrastructure/prisma";
import { ApiError } from "../../shared/errors";
import { getCampaignMetrics } from "../analytics/analytics.service";
import { createEmailSend } from "../email/email.service";
import { enqueueCampaignStep } from "../../infrastructure/queue";
import { getDelayMsForStep } from "./sequence.config";
import { renderTemplate } from "./template-renderer";

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

export type CampaignStepInput = { stepNumber: number; templateId: string | null; delayDays: number };

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
    await prisma.campaignStep.createMany({
      data: steps.map((s) => ({
        campaignId,
        stepNumber: s.stepNumber,
        templateId: s.templateId || null,
        delayDays: s.delayDays,
      })),
    });
  }
  return getCampaignSteps(campaignId, userId);
};

/** Returns delay in ms for a step. Uses CampaignStep if present, else fallback to sequence.config */
export async function getDelayMsForCampaignStep(
  campaignId: string,
  stepNumber: number
): Promise<number> {
  const step = await prisma.campaignStep.findUnique({
    where: { campaignId_stepNumber: { campaignId, stepNumber } },
  });
  if (step) return step.delayDays * 24 * 60 * 60 * 1000;
  return getDelayMsForStep(stepNumber) ?? 0;
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
    await prisma.campaignStep.createMany({
      data: payload.steps.map((s) => ({
        campaignId: campaign.id,
        stepNumber: s.stepNumber,
        templateId: s.templateId || null,
        delayDays: s.delayDays,
      })),
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

export const getCampaignWithMetrics = async (id: string, userId: string) => {
  const campaign = await getCampaignById(id, userId);
  const metrics = await getCampaignMetrics(id);
  return { ...campaign, metrics };
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

  let subject: string;
  let bodyHtml: string;
  let bodyText: string;

  if (stepRow?.template) {
    subject = renderTemplate(stepRow.template.title, vars);
    bodyHtml = renderTemplate(stepRow.template.content, vars);
    bodyText = renderTemplate(
      stepRow.template.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      vars
    );
  } else {
    subject = `Follow-up (Step ${payload.stepNumber})`;
    bodyHtml = `<p>Follow-up step ${payload.stepNumber}.</p>`;
    bodyText = `Follow-up step ${payload.stepNumber}.`;
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
