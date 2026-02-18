import { analyticsRepository } from "./analytics.repository";

export const recordEmailOpened = async (emailId: string, openedAt: Date) => {
  await analyticsRepository.createEmailOpenEvent({ emailId, openedAt });
};
