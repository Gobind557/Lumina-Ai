import { env } from "../config/env";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export type SendViaBrevoPayload = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string | null;
  /** Our internal email id; sent as tag so webhooks can map back. */
  emailId: string;
};

/**
 * Send a single transactional email via Brevo API.
 * Returns Brevo's message-id (for storing in Email.providerMessageId).
 */
export async function sendEmailViaBrevo(
  payload: SendViaBrevoPayload
): Promise<string> {
  const key = env.BREVO_API_KEY;
  if (!key) throw new Error("BREVO_API_KEY is not set");

  const [fromEmail, fromName] = parseFrom(payload.from);
  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: fromEmail, name: fromName || undefined },
      to: [{ email: payload.to }],
      subject: payload.subject,
      htmlContent: payload.html,
      textContent: payload.text || undefined,
      tags: [payload.emailId],
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    const msg = err.message || `Brevo API error: ${res.status}`;
    if (res.status === 401 || /key not found|unauthorized/i.test(msg)) {
      throw new Error(
        `Brevo API key invalid or expired. Check BREVO_API_KEY in .env (use API key from Brevo → Settings → SMTP & API → API Keys, not SMTP password). Original: ${msg}`
      );
    }
    throw new Error(msg);
  }

  const data = (await res.json()) as { messageId: string };
  return data.messageId;
}

function parseFrom(from: string): [string, string | null] {
  const match = from.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) return [match[2].trim(), match[1].trim()];
  return [from.trim(), null];
}
