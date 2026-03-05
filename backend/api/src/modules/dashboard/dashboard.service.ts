import { prisma } from "../../infrastructure/prisma";
import { getCampaignMetrics } from "../analytics/analytics.service";

export const getDashboardStats = async (userId: string) => {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const weekStart = new Date(now.setDate(now.getDate() - 7));

  const [totalEmails, todayEmails, weekEmails] = await Promise.all([
    prisma.email.count({ where: { userId, status: "SENT" } }),
    prisma.email.count({
      where: { userId, status: "SENT", sentAt: { gte: todayStart } },
    }),
    prisma.email.count({
      where: { userId, status: "SENT", sentAt: { gte: weekStart } },
    }),
  ]);

  const sentEmailIds = await prisma.email
    .findMany({
      where: { userId, status: "SENT" },
      select: { id: true },
    })
    .then((emails) => emails.map((e) => e.id));

  const [totalOpens, totalReplies, todayOpens, todayReplies] =
    await Promise.all([
      prisma.emailOpenEvent.count({ where: { emailId: { in: sentEmailIds } } }),
      prisma.emailReplyEvent.count({
        where: { emailId: { in: sentEmailIds },
        },
      }),
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

  const openRate =
    totalEmails > 0 ? Math.round((totalOpens / totalEmails) * 100) : 0;
  const replyRate =
    totalEmails > 0 ? Math.round((totalReplies / totalEmails) * 100) : 0;

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
  days: number = 7,
) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();

  const [opens, replies, emails] = await Promise.all([
    prisma.emailOpenEvent.findMany({
      where: {
        email: { userId },
        openedAt: { gte: startDate, lte: endDate },
      },
      select: { openedAt: true },
    }),
    prisma.emailReplyEvent.findMany({
      where: {
        email: { userId },
        repliedAt: { gte: startDate, lte: endDate },
      },
      select: { repliedAt: true },
    }),
    prisma.email.findMany({
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
    }),
  ]);

  const timeline: Record<string, { opens: number; replies: number }> = {};
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(endDate);
  rangeEnd.setHours(23, 59, 59, 999);
  while (cursor <= rangeEnd) {
    const day = cursor.toISOString().split("T")[0];
    timeline[day] = { opens: 0, replies: 0 };
    cursor.setDate(cursor.getDate() + 1);
  }

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
      isHot: Date.now() - open.openedAt.getTime() < 10 * 60 * 1000,
    })),
    replies: recentReplies.map((reply) => ({
      id: reply.id,
      emailId: reply.emailId,
      prospectName: reply.email.subject || reply.email.toEmail,
      activity: `Replied: ${reply.replySubject || "email"}`,
      time: formatTimeAgo(reply.repliedAt),
      minutesAgo: Math.floor((Date.now() - reply.repliedAt.getTime()) / 60000),
      isHot: true,
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
    }),
  );

  return campaignsWithMetrics;
};

export const getDashboardBestTime = async (userId: string) => {
  const lookbackDays = 14;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - lookbackDays);
  startDate.setHours(0, 0, 0, 0);

  const events = await Promise.all([
    prisma.emailOpenEvent.findMany({
      where: {
        email: { userId },
        openedAt: { gte: startDate },
      },
      select: {
        openedAt: true,
        emailId: true,
      },
    }),
    prisma.emailReplyEvent.findMany({
      where: {
        email: { userId },
        repliedAt: { gte: startDate },
      },
      select: {
        repliedAt: true,
        emailId: true,
      },
    }),
  ]);

  const [opens, replies] = events;

  if (opens.length === 0 && replies.length === 0) {
    return {
      bestDayOfWeek: 0,
      bestHour: 9,
      liftPercent: 0,
      sampleSize: 0,
    };
  }

  type BucketKey = string;
  const buckets: Record<
    BucketKey,
    { emails: Set<string>; opens: number; replies: number; dayOfWeek: number; hour: number }
  > = {};

  const addEventToBucket = (date: Date, emailId: string, isReply: boolean) => {
    const local = new Date(date);
    const dayOfWeek = local.getDay();
    const hour = local.getHours();
    const key = `${dayOfWeek}-${hour}`;
    if (!buckets[key]) {
      buckets[key] = {
        emails: new Set<string>(),
        opens: 0,
        replies: 0,
        dayOfWeek,
        hour,
      };
    }
    buckets[key].emails.add(emailId);
    if (isReply) {
      buckets[key].replies += 1;
    } else {
      buckets[key].opens += 1;
    }
  };

  opens.forEach((open) => addEventToBucket(open.openedAt, open.emailId, false));
  replies.forEach((reply) =>
    addEventToBucket(reply.repliedAt, reply.emailId, true),
  );

  let totalEmails = 0;
  let totalScore = 0;

  const bucketEntries = Object.values(buckets).map((bucket) => {
    const sentCount = bucket.emails.size;
    const openRate = sentCount > 0 ? bucket.opens / sentCount : 0;
    const replyRate = sentCount > 0 ? bucket.replies / sentCount : 0;
    const score = openRate * 0.6 + replyRate * 0.4;
    totalEmails += sentCount;
    totalScore += score;
    return {
      ...bucket,
      sentCount,
      score,
    };
  });

  if (bucketEntries.length === 0 || totalEmails === 0) {
    return {
      bestDayOfWeek: 0,
      bestHour: 9,
      liftPercent: 0,
      sampleSize: 0,
    };
  }

  const averageScore = totalScore / bucketEntries.length;
  const bestBucket = bucketEntries.reduce((best, current) =>
    current.score > best.score ? current : best,
  );

  const liftPercent =
    averageScore > 0 ? ((bestBucket.score - averageScore) / averageScore) * 100 : 0;

  return {
    bestDayOfWeek: bestBucket.dayOfWeek,
    bestHour: bestBucket.hour,
    liftPercent: Math.round(liftPercent * 10) / 10,
    sampleSize: totalEmails,
  };
};

export const getDashboardNextActions = async (userId: string) => {
  const lookbackMinutes = 60 * 24 * 3;
  const cutoff = new Date(Date.now() - lookbackMinutes * 60 * 1000);

  const [recentReplies, recentOpens] = await Promise.all([
    prisma.emailReplyEvent.findMany({
      where: {
        email: {
          userId,
        },
        repliedAt: { gte: cutoff },
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
    }),
    prisma.emailOpenEvent.findMany({
      where: {
        email: {
          userId,
        },
        openedAt: { gte: cutoff },
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
      take: 20,
    }),
  ]);

  const seenEmailIds = new Set<string>();
  const actions: Array<{
    prospectId: string | null;
    name: string;
    action: string;
    actionType: "follow-up" | "call" | "personalization";
    probability?: number;
    actionLabel: string;
    buttonLabel?: string;
    reasoning?: string;
  }> = [];

  recentReplies.forEach((reply) => {
    if (seenEmailIds.has(reply.email.id)) return;
    seenEmailIds.add(reply.email.id);
    const name =
      (reply.email.prospect
        ? `${reply.email.prospect.firstName || ""} ${
            reply.email.prospect.lastName || ""
          }`.trim()
        : reply.email.toEmail) || reply.email.toEmail;
    actions.push({
      prospectId: null,
      name,
      action: "Follow up on reply",
      actionType: "call",
      probability: 65,
      actionLabel: "Call now",
      reasoning: "Replied recently · high intent",
    });
  });

  recentOpens.forEach((open) => {
    if (seenEmailIds.has(open.email.id)) return;
    seenEmailIds.add(open.email.id);
    const name =
      (open.email.prospect
        ? `${open.email.prospect.firstName || ""} ${
            open.email.prospect.lastName || ""
          }`.trim()
        : open.email.toEmail) || open.email.toEmail;
    actions.push({
      prospectId: null,
      name,
      action: "Follow up",
      actionType: "follow-up",
      probability: 40,
      actionLabel: "Send follow-up",
      buttonLabel: "40%",
      reasoning: "Opened recently · no reply yet",
    });
  });

  return {
    actions: actions.slice(0, 10),
  };
};
