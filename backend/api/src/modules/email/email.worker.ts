import { Worker } from "bullmq";
import { env } from "../../config/env";
import { emailRepository } from "./email.repository";
import { sendEmailViaSmtp } from "../../infrastructure/smtp";
import { publish } from "../../infrastructure/eventBus";
import { EMAIL_SENT } from "./email.events";

const connection = { connection: { url: env.REDIS_URL } };

const buildTrackingPixelHtml = (emailId: string) => {
  const pixelUrl = `${env.APP_URL}/webhooks/email/open-pixel?email_id=${encodeURIComponent(
    emailId
  )}`;

  const pixelTag =
    `<img src="${pixelUrl}" alt="" width="1" height="1" style="display:none;"/>`;

  return pixelTag;
};

const worker = new Worker(
  "email-send",
  async (job) => {
    const { emailId } = job.data as { emailId: string };
    const email = await emailRepository.findEmailById(emailId);
    if (!email) return;

    try {
      const trackingPixel = buildTrackingPixelHtml(emailId);
      const htmlWithPixel = `${email.bodyHtml}${trackingPixel}`;

      const messageId = await sendEmailViaSmtp({
        from: email.fromEmail,
        to: email.toEmail,
        subject: email.subject,
        html: htmlWithPixel,
        text: email.bodyText ?? undefined,
      });

      const sentAt = new Date();
      await emailRepository.updateEmailSent(emailId, messageId, sentAt);

      await publish(EMAIL_SENT, {
        emailId,
        userId: email.userId,
        prospectId: email.prospectId ?? undefined,
        campaignId: email.campaignId ?? undefined,
        providerMessageId: messageId,
        sentAt: sentAt.toISOString(),
      });
    } catch (error) {
      await emailRepository.updateEmailFailed(emailId);
      throw error;
    }
  },
  connection
);

worker.on("failed", (job, err) => {
  // eslint-disable-next-line no-console
  console.error("Email job failed", job?.id, err);
});
