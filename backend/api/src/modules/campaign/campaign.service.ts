import { prisma } from "../../infrastructure/prisma";
import { ApiError } from "../../shared/errors";
import { getCampaignMetrics } from "../analytics/analytics.service";
import { createEmailSend } from "../email/email.service";

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
    },
  });
  if (!campaign) throw new ApiError(404, "NOT_FOUND", "Campaign not found");
  return campaign;
};

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
  }
  return campaign;
};

export const updateCampaignStatus = async (
  id: string,
  userId: string,
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED"
) => {
  const campaign = await prisma.campaign.findFirst({ where: { id, userId } });
  if (!campaign) throw new ApiError(404, "NOT_FOUND", "Campaign not found");

  return prisma.campaign.update({
    where: { id },
    data: { status },
  });
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
 * Used by the campaign-step BullMQ worker. Uses placeholder content per step;
 * can be extended later with campaign step templates.
 */
export const executeCampaignStep = async (payload: {
  campaignId: string;
  prospectId: string;
  userId: string;
  stepNumber: number;
}) => {
  const [campaign, prospect, user] = await Promise.all([
    prisma.campaign.findFirst({
      where: { id: payload.campaignId, userId: payload.userId },
      select: { id: true, workspaceId: true, status: true },
    }),
    prisma.prospect.findUnique({
      where: { id: payload.prospectId },
      select: { email: true, firstName: true, lastName: true },
    }),
    prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true },
    }),
  ]);

  if (!campaign || campaign.status !== "ACTIVE") return;
  if (!prospect || !user?.email) return;

  const subject = `Follow-up (Step ${payload.stepNumber})`;
  const bodyHtml = `<p>Follow-up step ${payload.stepNumber}.</p>`;
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
    bodyText: `Follow-up step ${payload.stepNumber}.`,
    idempotencyKey,
  });
};
