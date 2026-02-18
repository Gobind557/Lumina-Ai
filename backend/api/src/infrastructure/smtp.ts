import nodemailer from "nodemailer";
import { env } from "../config/env";

export const createTransporter = () => {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

export const sendEmailViaSmtp = async (payload: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string | null;
}) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: payload.from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text ?? undefined,
  });
  return info.messageId;
};
