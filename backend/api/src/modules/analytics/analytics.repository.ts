import { prisma } from "../../infrastructure/prisma";

export const analyticsRepository = {
  createEmailOpenEvent: (data: { emailId: string; openedAt: Date }) =>
    prisma.emailOpenEvent.create({ data }),
};
