import { Worker } from "bullmq";
import { env } from "../config/env";
import { prisma } from "../models";
import { sendEmailViaSmtp } from "../services/emailSender.service";

const connection = { connection: { url: env.REDIS_URL } };

const worker = new Worker(
  "email-send",
  async (job) => {
    const { emailId } = job.data as { emailId: string };
    const email = await prisma.email.findUnique({ where: { id: emailId } });
    if (!email) return;

    try {
      const messageId = await sendEmailViaSmtp({
        from: email.fromEmail,
        to: email.toEmail,
        subject: email.subject,
        html: email.bodyHtml,
        text: email.bodyText ?? undefined,
      });

      await prisma.email.update({
        where: { id: emailId },
        data: {
          status: "SENT",
          providerMessageId: messageId,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      await prisma.email.update({
        where: { id: emailId },
        data: { status: "FAILED" },
      });
      throw error;
    }
  },
  connection
);

worker.on("failed", (job, err) => {
  // eslint-disable-next-line no-console
  console.error("Email job failed", job?.id, err);
});
