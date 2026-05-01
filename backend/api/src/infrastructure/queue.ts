import { Queue } from "bullmq";
import { getRedisClient } from "./redisClient";
import { env } from "../config/env";

const connection = { connection: getRedisClient() };

export const emailQueue = new Queue("email-send", connection);
export const campaignStepQueue = new Queue("campaign-step", connection);

export const enqueueEmailSend = async (emailId: string) => {
  await emailQueue.add(
    "send-email",
    { emailId },
    { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
  );
};

export type CampaignStepJobData = {
  campaignId: string;
  prospectId: string;
  userId: string;
  stepNumber: number;
};

/**
 * Schedule a campaign step to run after a delay (e.g. send next sequence email).
 * Uses BullMQ delayed job so the step runs at the right time.
 */
export const enqueueCampaignStep = async (
  data: CampaignStepJobData,
  delayMs: number
) => {
  await campaignStepQueue.add(
    "execute-step",
    data,
    {
      delay: delayMs,
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      jobId: `${data.campaignId}-${data.prospectId}-step-${data.stepNumber}`,
    }
  );
};
