import OpenAI from "openai";
import { env } from "../../config/env";

const client = new OpenAI({
  apiKey: env.GROQ_API_KEY,
  baseURL: env.GROQ_BASE_URL,
});

const buildPrompt = (payload: {
  subject?: string | null;
  body: string;
  tone?: string;
  prospect?: {
    firstName?: string | null;
    lastName?: string | null;
    company?: string | null;
    jobTitle?: string | null;
  };
  instruction?: string;
}) => {
  const name = [payload.prospect?.firstName, payload.prospect?.lastName]
    .filter(Boolean)
    .join(" ");
  const lines = [
    "You are an AI sales email assistant.",
    payload.instruction
      ? `Instruction: ${payload.instruction}`
      : "Instruction: personalize the email for the prospect.",
    payload.tone ? `Tone: ${payload.tone}` : "",
    name ? `Prospect name: ${name}` : "",
    payload.prospect?.company ? `Company: ${payload.prospect.company}` : "",
    payload.prospect?.jobTitle ? `Role: ${payload.prospect.jobTitle}` : "",
    payload.subject ? `Subject: ${payload.subject}` : "",
    "Body:",
    payload.body,
  ]
    .filter(Boolean)
    .join("\n");

  return lines;
};

const callOpenAI = async (prompt: string) => {
  const response = await client.chat.completions.create({
    model: env.GROQ_MODEL,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "Return only the rewritten email body text. Do not include explanations.",
      },
      { role: "user", content: prompt },
    ],
  });

  return response.choices[0]?.message?.content?.trim() || "";
};

export const personalizeEmail = async (payload: {
  subject?: string | null;
  body: string;
  tone?: string;
  prospect?: {
    firstName?: string | null;
    lastName?: string | null;
    company?: string | null;
    jobTitle?: string | null;
  };
}) => {
  const prompt = buildPrompt(payload);
  const body = await callOpenAI(prompt);
  return { body };
};

export const rewriteEmail = async (payload: {
  subject?: string | null;
  body: string;
  instruction: string;
}) => {
  const prompt = buildPrompt(payload);
  const body = await callOpenAI(prompt);
  return { body };
};

export const scoreEmail = (payload: { subject?: string | null; body: string }) => {
  const bodyLength = payload.body.length;
  const subjectLength = payload.subject?.length ?? 0;
  const spamKeywords = ["free", "guarantee", "urgent", "winner"];
  const spamHit = spamKeywords.filter((k) =>
    payload.body.toLowerCase().includes(k)
  );
  const spamRisk = Math.min(0.9, 0.1 + spamHit.length * 0.15);
  const replyProbability = Math.max(
    0.1,
    Math.min(0.9, 0.8 - Math.abs(bodyLength - 400) / 1000)
  );

  return {
    spam_risk: Number(spamRisk.toFixed(2)),
    reply_probability: Number(replyProbability.toFixed(2)),
    signals: {
      subject_length: subjectLength,
      body_length: bodyLength,
      link_count: (payload.body.match(/https?:\/\//g) || []).length,
      spam_keywords: spamHit,
    },
  };
};
