import { prisma } from "../../infrastructure/prisma";
import { ApiError } from "../../shared/errors";
import { getCampaignMetrics } from "../analytics/analytics.service";

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

export const createCampaign = async (payload: {
  userId: string;
  workspaceId?: string | null;
  name: string;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
}) => {
  return prisma.campaign.create({
    data: {
      userId: payload.userId,
      workspaceId: payload.workspaceId ?? null,
      name: payload.name,
      description: payload.description ?? null,
      status: "DRAFT",
      startDate: payload.startDate ?? null,
      endDate: payload.endDate ?? null,
    },
  });
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
