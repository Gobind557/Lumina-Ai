import { Queue } from "bullmq";
import { env } from "../config/env";

const connection = { connection: { url: env.REDIS_URL } };

export const emailQueue = new Queue("email-send", connection);

export const enqueueEmailSend = async (emailId: string) => {
  await emailQueue.add(
    "send-email",
    { emailId },
    { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
  );
};
