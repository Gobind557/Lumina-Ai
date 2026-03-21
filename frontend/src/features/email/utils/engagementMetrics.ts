import type { Prospect } from "@/shared/types";
import {
  generateSuggestions,
  labelForSuggestionType,
  prospectToSuggestionContext,
  type SuggestionSeverity,
  type SuggestionType,
  type TextSuggestion,
} from "./generateSuggestions";

export type PersonalizationBand = "weak" | "moderate" | "strong";

export type CopilotEngagement = {
  replyLikelihood: number;
  personalizationStrength: PersonalizationBand;
  hintTitle: string;
  hintDetail: string;
  footnote: string;
  hasPersonalization: boolean;
  subjectIsPresent: boolean;
  hasCompanyMention: boolean;
};

export type RecipientExtras = {
  recipientName?: string;
  recipientCompany?: string;
};

const severityRank: Record<SuggestionSeverity, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function tierLabel(sev: SuggestionSeverity): string {
  if (sev === "high") return "High priority";
  if (sev === "medium") return "Worth improving";
  return "Polish";
}

function hintFromTopSuggestion(suggestions: TextSuggestion[]): {
  hintTitle: string;
  hintDetail: string;
  topType: SuggestionType;
  topSeverity: SuggestionSeverity;
} | null {
  if (suggestions.length === 0) return null;
  const sorted = [...suggestions].sort((a, b) => {
    const ds = severityRank[b.severity] - severityRank[a.severity];
    if (ds !== 0) return ds;
    const typeOrder = (t: SuggestionType) =>
      t === "personalization" ? 0 : t === "clarity" ? 1 : t === "structure" ? 2 : t === "length" ? 3 : 4;
    return typeOrder(a.type) - typeOrder(b.type);
  });
  const s = sorted[0];
  return {
    hintTitle: `${tierLabel(s.severity)} · ${labelForSuggestionType(s.type)}`,
    hintDetail: s.message,
    topType: s.type,
    topSeverity: s.severity,
  };
}

function footnoteForLowScore(
  topType: SuggestionType | undefined,
  topSeverity: SuggestionSeverity | undefined,
): string {
  if (!topType) {
    return "Tighten the opener and ask — small edits here usually move this score the most.";
  }
  switch (topType) {
    case "length":
      return "You’re in a good range once you add a sentence or two of specific relevance; recheck after.";
    case "personalization":
      return topSeverity === "high"
        ? "Fixing the top personalization gap tends to lift this score quickly."
        : "A bit more tailoring to this recipient usually bumps reply odds.";
    case "clarity":
      return "Replacing placeholders or generic lines here is the fastest path to a higher score.";
    case "structure":
      return "A short greeting and a clear next step often nudge this upward without adding fluff.";
    case "subject_signal":
      return "Sharpen the subject and body hook together — both feed into how ‘replyable’ this feels.";
    default:
      return "Address the top note above; it’s tied to what’s dragging this score down.";
  }
}

function suggestionPenalty(suggestions: TextSuggestion[]): number {
  let p = 0;
  for (const s of suggestions) {
    if (s.severity === "high") p += 7;
    else if (s.severity === "medium") p += 4;
    else p += 2;
  }
  return Math.min(30, p);
}

/**
 * Draft + prospect + optional To: name/company for Reply Likelihood and Personalization.
 */
export function computeCopilotEngagement(
  draft: { content: string; subject: string },
  prospect?: Prospect | null,
  extras?: RecipientExtras,
): CopilotEngagement {
  const content = draft.content ?? "";
  const subject = draft.subject ?? "";
  const t = content.toLowerCase();
  const s = subject.trim();

  const nameSource =
    prospect?.name?.trim() || extras?.recipientName?.trim() || "";
  const companySource =
    prospect?.company?.trim() || extras?.recipientCompany?.trim() || "";

  const placeholder = /\[insert|{{\s*\w+|\[your\s|\[name\]/i.test(content);
  const genericLinked =
    /\bi noticed (from )?your (recent )?linkedin\b/i.test(t) ||
    /\bi saw your (recent )?linkedin/i.test(t);

  let nameHit = false;
  if (nameSource) {
    const parts = nameSource
      .toLowerCase()
      .split(/\s+/)
      .filter((p) => p.length > 1);
    nameHit = parts.some((p) => t.includes(p));
  }

  let companyHit = false;
  if (companySource) {
    companyHit = t.includes(companySource.toLowerCase());
  }

  const hasGreeting = /\b(hi|hello|hey)\b[,!\s]/i.test(content);

  let score = 38;
  if (hasGreeting) score += 8;
  if (nameHit) score += 22;
  if (companyHit) score += 14;
  if (s.length >= 6 && s.length < 72) score += 10;
  if (/\?/.test(s)) score += 4;
  if (content.length > 100 && content.length < 2000) score += 6;
  if (placeholder) score -= 18;
  if (genericLinked) score -= 12;
  if (nameSource && !nameHit) score -= 6;
  if (companySource && !companyHit) score -= 6;

  const replyLikelihood = Math.round(Math.max(12, Math.min(95, score)));

  const hasPersonalization =
    nameHit ||
    companyHit ||
    (!placeholder && content.length > 140);

  let personalizationStrength: PersonalizationBand = "weak";
  if (nameHit && companyHit && !placeholder) personalizationStrength = "strong";
  else if (
    nameHit ||
    companyHit ||
    (hasGreeting && content.length > 120 && !placeholder)
  ) {
    personalizationStrength = "moderate";
  }

  const subjectIsPresent = s.length >= 6;

  let hintTitle = "Add personalization to improve further";
  let hintDetail =
    "A tailored opening often boosts replies and engagement.";

  if (replyLikelihood >= 78) {
    hintTitle = "Strong draft — polish the ask or subject";
    hintDetail = "Small tweaks to clarity and next steps often lift replies.";
  } else if (placeholder) {
    hintTitle = "Replace placeholders before sending";
    hintDetail = "Bracketed slots make the email feel unfinished.";
  } else if (genericLinked) {
    hintTitle = "Swap the generic LinkedIn hook";
    hintDetail = "One specific detail about them reads far more human.";
  } else if (nameSource && !nameHit) {
    hintTitle = "Use their name naturally in the opener";
    hintDetail = "A light name mention increases trust and replies.";
  } else if (companySource && !companyHit) {
    hintTitle = "Reference their company when it fits";
    hintDetail = "Tie the email to their world for stronger relevance.";
  } else if (!subjectIsPresent) {
    hintTitle = "Add a clear subject line";
    hintDetail = "Subjects under ~70 characters with a hook improve opens.";
  }

  const footnote =
    "Best results come from a personalized opener plus a clear next step.";

  return {
    replyLikelihood,
    personalizationStrength,
    hintTitle,
    hintDetail,
    footnote,
    hasPersonalization,
    subjectIsPresent,
    hasCompanyMention: companyHit,
  };
}

/**
 * Send Readiness: merges rule engine (`generateSuggestions`) with base engagement.
 * Re-compute when `draft` / prospect / recipient fields change (memoize in UI).
 */
export function buildCopilotReadinessState(
  draft: { content: string; subject: string },
  prospect?: Prospect | null,
  extras?: RecipientExtras,
): CopilotEngagement {
  const ctx = prospectToSuggestionContext(prospect, extras);
  const suggestions = generateSuggestions(draft.content, ctx);
  const base = computeCopilotEngagement(draft, prospect, extras);

  const penalty = suggestionPenalty(suggestions);
  const replyLikelihood = Math.max(
    12,
    Math.min(95, base.replyLikelihood - penalty),
  );

  const fromSug = hintFromTopSuggestion(suggestions);
  const hintTitle = fromSug?.hintTitle ?? base.hintTitle;
  const hintDetail = fromSug?.hintDetail ?? base.hintDetail;

  let personalizationStrength = base.personalizationStrength;
  const highPers = suggestions.some(
    (x) => x.type === "personalization" && x.severity === "high",
  );
  if (highPers && personalizationStrength === "strong") {
    personalizationStrength = "moderate";
  }

  let footnote = base.footnote;
  if (replyLikelihood >= 78) {
    footnote =
      "Strong signals — tighten the CTA and you’re ready to send.";
  } else if (replyLikelihood < 48) {
    footnote = footnoteForLowScore(fromSug?.topType, fromSug?.topSeverity);
  }

  return {
    ...base,
    replyLikelihood,
    personalizationStrength,
    hintTitle,
    hintDetail,
    footnote,
  };
}
