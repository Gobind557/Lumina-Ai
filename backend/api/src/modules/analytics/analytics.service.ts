import { analyticsRepository } from "./analytics.repository";
import { prisma } from "../../infrastructure/prisma";

export const recordEmailOpened = async (emailId: string, openedAt: Date) => {
  await analyticsRepository.createEmailOpenEvent({ emailId, openedAt });
};

export const recordEmailReplied = async (
  emailId: string,
  repliedAt: Date,
  replySubject?: string | null,
  replyBody?: string | null
) => {
  await analyticsRepository.createEmailReplyEvent({
    emailId,
    repliedAt,
    replySubject,
    replyBody,
  });
};

export const updateTemplateMetrics = async (templateId: string) => {
  const metrics = await analyticsRepository.getTemplateMetrics(templateId);
  await prisma.template.update({
    where: { id: templateId },
    data: {
      openRate: metrics.openRate,
      replyRate: metrics.replyRate,
    },
  });
};

export const getEmailMetrics = async (emailId: string) => {
  return analyticsRepository.getEmailMetrics(emailId);
};

export const getCampaignMetrics = async (campaignId: string) => {
  return analyticsRepository.getCampaignMetrics(campaignId);
};
