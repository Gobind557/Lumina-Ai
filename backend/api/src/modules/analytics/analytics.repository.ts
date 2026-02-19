import { prisma } from "../../infrastructure/prisma";

export const analyticsRepository = {
  createEmailOpenEvent: (data: { emailId: string; openedAt: Date }) =>
    prisma.emailOpenEvent.create({ data }),

  createEmailReplyEvent: (data: {
    emailId: string;
    repliedAt: Date;
    replySubject?: string | null;
    replyBody?: string | null;
  }) => prisma.emailReplyEvent.create({ data }),

  getEmailMetrics: async (emailId: string) => {
    const [opens, replies] = await Promise.all([
      prisma.emailOpenEvent.count({ where: { emailId } }),
      prisma.emailReplyEvent.count({ where: { emailId } }),
    ]);
    return { opens, replies };
  },

  getTemplateMetrics: async (templateId: string) => {
    // Get all emails that used this template (via draftId -> templateId lookup)
    // For now, we'll compute from emails that reference this template
    // This assumes templateId is stored somewhere - you may need to add a templateId field to EmailDraft
    const template = await prisma.template.findUnique({ where: { id: templateId } });
    if (!template) return { opens: 0, replies: 0, openRate: 0, replyRate: 0 };

    // Count emails sent using this template (via drafts)
    const drafts = await prisma.emailDraft.findMany({
      where: { userId: template.userId },
      select: { id: true },
    });
    const draftIds = drafts.map((d) => d.id);

    const emails = await prisma.email.findMany({
      where: { draftId: { in: draftIds }, status: "SENT" },
      select: { id: true },
    });
    const emailIds = emails.map((e) => e.id);

    if (emailIds.length === 0) return { opens: 0, replies: 0, openRate: 0, replyRate: 0 };

    const [opens, replies] = await Promise.all([
      prisma.emailOpenEvent.count({ where: { emailId: { in: emailIds } } }),
      prisma.emailReplyEvent.count({ where: { emailId: { in: emailIds } } }),
    ]);

    const sentCount = emailIds.length;
    const openRate = sentCount > 0 ? Math.round((opens / sentCount) * 100) : 0;
    const replyRate = sentCount > 0 ? Math.round((replies / sentCount) * 100) : 0;

    return { opens, replies, openRate, replyRate };
  },

  getCampaignMetrics: async (campaignId: string) => {
    const emails = await prisma.email.findMany({
      where: { campaignId, status: "SENT" },
      select: { id: true },
    });
    const emailIds = emails.map((e) => e.id);

    if (emailIds.length === 0) return { opens: 0, replies: 0, openRate: 0, replyRate: 0 };

    const [opens, replies] = await Promise.all([
      prisma.emailOpenEvent.count({ where: { emailId: { in: emailIds } } }),
      prisma.emailReplyEvent.count({ where: { emailId: { in: emailIds } } }),
    ]);

    const sentCount = emailIds.length;
    const openRate = sentCount > 0 ? Math.round((opens / sentCount) * 100) : 0;
    const replyRate = sentCount > 0 ? Math.round((replies / sentCount) * 100) : 0;

    return { opens, replies, openRate, replyRate, sentCount };
  },
};
