import { Worker } from "bullmq";
import { env } from "../../config/env";
import type { CampaignStepJobData } from "../../infrastructure/queue";
import { executeCampaignStep } from "./campaign.service";

const connection = { connection: { url: env.REDIS_URL } };

const worker = new Worker<CampaignStepJobData>(
  "campaign-step",
  async (job) => {
    const { campaignId, prospectId, userId, stepNumber } = job.data;
    await executeCampaignStep({ campaignId, prospectId, userId, stepNumber });
  },
  {
    connection: { url: env.REDIS_URL },
    stalledInterval: 300000,
    drainDelay: 60,
    lockDuration: 30000,
  }
);

worker.on("failed", (job, err) => {
  // eslint-disable-next-line no-console
  console.error("Campaign step job failed", job?.id, err);
});
