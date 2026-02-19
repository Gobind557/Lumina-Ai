import { prisma } from "../../infrastructure/prisma";
import { getCampaignMetrics } from "../analytics/analytics.service";

export const getDashboardStats = async (userId: string) => {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const weekStart = new Date(now.setDate(now.getDate() - 7));

  // Get email counts
  const [totalEmails, todayEmails, weekEmails] = await Promise.all([
    prisma.email.count({ where: { userId, status: "SENT" } }),
    prisma.email.count({
      where: { userId, status: "SENT", sentAt: { gte: todayStart } },
    }),
    prisma.email.count({
      where: { userId, status: "SENT", sentAt: { gte: weekStart } },
    }),
  ]);

  // Get open/reply counts
  const sentEmailIds = await prisma.email
    .findMany({
      where: { userId, status: "SENT" },
      select: { id: true },
    })
    .then((emails) => emails.map((e) => e.id));

  const [totalOpens, totalReplies, todayOpens, todayReplies] = await Promise.all([
    prisma.emailOpenEvent.count({ where: { emailId: { in: sentEmailIds } } }),
    prisma.emailReplyEvent.count({ where: { emailId: { in: sentEmailIds } } }),
    prisma.emailOpenEvent.count({
      where: {
        emailId: { in: sentEmailIds },
        openedAt: { gte: todayStart },
      },
    }),
    prisma.emailReplyEvent.count({
      where: {
        emailId: { in: sentEmailIds },
        repliedAt: { gte: todayStart },
      },
    }),
  ]);

  // Calculate rates
  const openRate = totalEmails > 0 ? Math.round((totalOpens / totalEmails) * 100) : 0;
  const replyRate = totalEmails > 0 ? Math.round((totalReplies / totalEmails) * 100) : 0;

  // Get active campaigns
  const activeCampaigns = await prisma.campaign.count({
    where: { userId, status: "ACTIVE" },
  });

  return {
    emails: {
      total: totalEmails,
      today: todayEmails,
      thisWeek: weekEmails,
    },
    engagement: {
      opens: { total: totalOpens, today: todayOpens },
      replies: { total: totalReplies, today: todayReplies },
      openRate,
      replyRate,
    },
    campaigns: {
      active: activeCampaigns,
    },
  };
};

export const getDashboardTimeline = async (
  userId: string,
  days: number = 7
) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get emails sent in timeframe
  const emails = await prisma.email.findMany({
    where: {
      userId,
      status: "SENT",
      sentAt: { gte: startDate },
    },
    select: {
      id: true,
      sentAt: true,
      subject: true,
      toEmail: true,
      prospect: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { sentAt: "desc" },
    take: 100,
  });

  // Get opens and replies for these emails
  const emailIds = emails.map((e) => e.id);
  const [opens, replies] = await Promise.all([
    prisma.emailOpenEvent.findMany({
      where: { emailId: { in: emailIds } },
      select: { emailId: true, openedAt: true },
    }),
    prisma.emailReplyEvent.findMany({
      where: { emailId: { in: emailIds } },
      select: { emailId: true, repliedAt: true },
    }),
  ]);

  // Group by day
  const timeline: Record<string, { opens: number; replies: number }> = {};
  emails.forEach((email) => {
    const day = email.sentAt?.toISOString().split("T")[0] || "";
    if (!timeline[day]) timeline[day] = { opens: 0, replies: 0 };
  });

  opens.forEach((open) => {
    const day = open.openedAt.toISOString().split("T")[0];
    if (timeline[day]) timeline[day].opens++;
  });

  replies.forEach((reply) => {
    const day = reply.repliedAt.toISOString().split("T")[0];
    if (timeline[day]) timeline[day].replies++;
  });

  return {
    emails: emails.map((email) => ({
      id: email.id,
      sentAt: email.sentAt,
      subject: email.subject,
      toEmail: email.toEmail,
      prospectName: email.prospect
        ? `${email.prospect.firstName || ""} ${email.prospect.lastName || ""}`.trim()
        : email.toEmail,
    })),
    timeline: Object.entries(timeline)
      .map(([day, data]) => ({
        day: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
        date: day,
        opens: data.opens,
        replies: data.replies,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
};

export const getDashboardMomentum = async (userId: string) => {
  const recentOpens = await prisma.emailOpenEvent.findMany({
    where: {
      email: {
        userId,
      },
    },
    include: {
      email: {
        select: {
          id: true,
          subject: true,
          toEmail: true,
          prospect: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: { openedAt: "desc" },
    take: 10,
  });

  const recentReplies = await prisma.emailReplyEvent.findMany({
    where: {
      email: {
        userId,
      },
    },
    include: {
      email: {
        select: {
          id: true,
          subject: true,
          toEmail: true,
          prospect: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: { repliedAt: "desc" },
    take: 10,
  });

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "yesterday" : `${days}d`;
  };

  return {
    opens: recentOpens.map((open) => ({
      id: open.id,
      emailId: open.emailId,
      prospectName: open.email.subject || open.email.toEmail,
      activity: `Opened: ${open.email.subject || "email"}`,
      time: formatTimeAgo(open.openedAt),
      minutesAgo: Math.floor((Date.now() - open.openedAt.getTime()) / 60000),
      isHot: Date.now() - open.openedAt.getTime() < 10 * 60 * 1000, // Last 10 minutes
    })),
    replies: recentReplies.map((reply) => ({
      id: reply.id,
      emailId: reply.emailId,
      prospectName: reply.email.subject || reply.email.toEmail,
      activity: `Replied: ${reply.replySubject || "email"}`,
      time: formatTimeAgo(reply.repliedAt),
      minutesAgo: Math.floor((Date.now() - reply.repliedAt.getTime()) / 60000),
      isHot: true, // Replies are always hot
    })),
  };
};

export const getDashboardCampaigns = async (userId: string) => {
  const campaigns = await prisma.campaign.findMany({
    where: {
      userId,
      status: { in: ["ACTIVE", "DRAFT"] },
    },
    select: {
      id: true,
      name: true,
      status: true,
      startDate: true,
      endDate: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const campaignsWithMetrics = await Promise.all(
    campaigns.map(async (campaign) => {
      const metrics = await getCampaignMetrics(campaign.id);
      return {
        ...campaign,
        metrics,
      };
    })
  );

  return campaignsWithMetrics;
};
