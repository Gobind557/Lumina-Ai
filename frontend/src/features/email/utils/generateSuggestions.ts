/**
 * Rule-based suggestions for the copilot. Wording variants are chosen deterministically
 * (stable per rule + coarse context) so the panel doesn’t flicker on every keystroke.
 */

export type SuggestionSeverity = "low" | "medium" | "high";

export type SuggestionType =
  | "personalization"
  | "clarity"
  | "structure"
  | "length"
  | "subject_signal";

export type ProspectForSuggestions = {
  company?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  /** Resolved display name if available */
  name?: string | null;
} | null;

export type TextSuggestion = {
  type: SuggestionType;
  severity: SuggestionSeverity;
  message: string;
  /** Substring to highlight in `text` (first case-insensitive occurrence) */
  highlightSnippet?: string;
};

/**
 * Deterministic “variant” pick so hints don’t flicker on every keystroke.
 * Entropy should change when the underlying issue changes, not on each character.
 */
function stablePick<T>(ruleKey: string, choices: readonly T[], ...entropy: (string | number)[]): T {
  const s = [ruleKey, ...entropy.map(String)].join("|");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const idx = Math.abs(h) % choices.length;
  return choices[idx]!;
}

function findFirstMatch(text: string, snippet: string): { start: number; end: number } | null {
  if (!snippet) return null;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(snippet.toLowerCase());
  if (idx < 0) return null;
  return { start: idx, end: idx + snippet.length };
}

/** Public API: suggestions for a draft body + prospect context. */
export function generateSuggestions(
  text: string,
  prospect: ProspectForSuggestions,
): TextSuggestion[] {
  const trimmed = text ?? "";
  const lower = trimmed.toLowerCase();
  const out: TextSuggestion[] = [];

  const company = prospect?.company?.trim();
  if (company && !lower.includes(company.toLowerCase())) {
    out.push({
      type: "personalization",
      severity: "high",
      message: stablePick(
        "pers.company",
        [
          "No company mention detected — tie this to their world.",
          `Weave in ${company} so it reads one-to-one, not broadcast.`,
          "Add a concrete company reference to lift relevance.",
          "Prospects reply more when the email clearly reflects their org.",
        ],
        company,
      ),
    });
  }

  const prospectName =
    prospect?.name?.trim() ||
    [prospect?.first_name, prospect?.last_name].filter(Boolean).join(" ").trim();
  if (prospectName) {
    const parts = prospectName.toLowerCase().split(/\s+/).filter(Boolean);
    const mentioned = parts.some((p) => p.length > 1 && lower.includes(p));
    if (!mentioned) {
      out.push({
        type: "personalization",
        severity: "medium",
        message: stablePick(
          "pers.name",
          [
            "No name in the body — a light greeting with their name boosts replies.",
            "Consider addressing them directly; it signals this wasn’t mass-blasted.",
            "A single natural name mention early often increases engagement.",
          ],
          prospectName,
        ),
      });
    }
  }

  const linkedInRe =
    /\b(i noticed (from )?your (recent )?linkedin|i saw your (recent )?linkedin post)\b[^.!?]*[.!?]?/gi;
  const lm = linkedInRe.exec(trimmed);
  if (lm) {
    out.push({
      type: "personalization",
      severity: "high",
      message: stablePick(
        "pers.linkedin",
        [
          "Too generic — personalize this line with something only they’d recognize.",
          "Swap the LinkedIn boilerplate for a specific detail about them.",
          "This opener reads templated; make one unmistakably personal hook.",
        ],
        lm[0].trim().slice(0, 64),
      ),
      highlightSnippet: lm[0].trim(),
    });
  }

  const placeholderRe = /\[[^\]\n]{0,80}\]/g;
  const pm = placeholderRe.exec(trimmed);
  if (pm) {
    out.push({
      type: "clarity",
      severity: "high",
      message: stablePick(
        "clarity.placeholder",
        [
          "Replace placeholders with real details before sending.",
          "Bracketed placeholders scream draft — fill them in or remove the line.",
          "Finish this thought with specifics; vague slots hurt credibility.",
        ],
        pm[0],
      ),
      highlightSnippet: pm[0],
    });
  }

  if (!/\b(hi|hello|hey)\b[,!\s]/i.test(trimmed) && trimmed.length > 20) {
    out.push({
      type: "structure",
      severity: "low",
      message: stablePick(
        "structure.greeting",
        [
          "Add a short greeting so the email feels human and easy to scan.",
          "Open with a quick hello — it softens the ask.",
          "A one-line greeting improves readability for busy readers.",
        ],
        Math.floor(trimmed.length / 50),
      ),
    });
  }

  if (trimmed.length > 0 && trimmed.length < 80) {
    out.push({
      type: "length",
      severity: "medium",
      message: stablePick(
        "length.short",
        [
          "A bit thin on context — one more specific sentence usually helps.",
          "Consider adding a line of relevance before your ask.",
          "Short is fine, but a touch more ‘why you, why now’ often converts better.",
        ],
        Math.floor(trimmed.length / 25),
      ),
    });
  }

  if (trimmed.length > 520) {
    out.push({
      type: "clarity",
      severity: "low",
      message: stablePick(
        "length.long",
        [
          "Pretty long — tighten the middle so the CTA still pops.",
          "Busy inboxes reward brevity; try cutting one paragraph.",
          "Consider moving details to a follow-up and keeping this email sharp.",
        ],
        Math.floor(trimmed.length / 120),
      ),
      highlightSnippet: trimmed.slice(0, Math.min(80, trimmed.length)),
    });
  }

  const weakPhrases = [
    "i hope this email finds you well",
    "touching base",
    "circling back",
    "just checking in",
    "pick your brain",
  ];
  for (const phrase of weakPhrases) {
    if (lower.includes(phrase)) {
      const found = findFirstMatch(trimmed, phrase);
      if (found) {
        out.push({
          type: "clarity",
          severity: "medium",
          message: stablePick(
            "clarity.weak_phrase",
            [
              "This phrasing is overused — try a fresher, more direct line.",
              "Readers have seen this opener a thousand times — swap for specificity.",
              "Too generic — replace with a concrete observation or question.",
            ],
            phrase,
          ),
          highlightSnippet: trimmed.slice(found.start, found.end),
        });
      }
      break;
    }
  }

  return out.slice(0, 8);
}

export type InlineHighlight = {
  start: number;
  end: number;
  title: string;
  severity: SuggestionSeverity;
};

function severityRank(s: SuggestionSeverity): number {
  if (s === "high") return 3;
  if (s === "medium") return 2;
  return 1;
}

/** Turn suggestions into non-overlapping highlight ranges (higher severity wins conflicts). */
export function highlightsFromSuggestions(
  text: string,
  suggestions: TextSuggestion[],
): InlineHighlight[] {
  const raw: InlineHighlight[] = [];
  for (const s of suggestions) {
    if (!s.highlightSnippet) continue;
    const m = findFirstMatch(text, s.highlightSnippet);
    if (!m) continue;
    raw.push({
      start: m.start,
      end: m.end,
      title: s.message,
      severity: s.severity,
    });
  }
  if (raw.length === 0) return [];

  raw.sort((a, b) => {
    const ds = severityRank(b.severity) - severityRank(a.severity);
    if (ds !== 0) return ds;
    return a.start - b.start;
  });

  const kept: InlineHighlight[] = [];
  for (const r of raw) {
    const overlaps = kept.some((k) => !(r.end <= k.start || r.start >= k.end));
    if (!overlaps) kept.push(r);
  }
  kept.sort((a, b) => a.start - b.start);
  return kept;
}

/** For AI suggestion card “weak spots” list */
export function suggestionsToWeakPhrases(
  suggestions: TextSuggestion[],
): Array<{ text: string; hint: string }> {
  return suggestions.slice(0, 5).map((s) => ({
    text: s.highlightSnippet?.slice(0, 48) || labelForType(s.type),
    hint: s.message,
  }));
}

function labelForType(t: SuggestionType): string {
  switch (t) {
    case "personalization":
      return "Personalization";
    case "clarity":
      return "Clarity";
    case "structure":
      return "Structure";
    case "length":
      return "Length";
    case "subject_signal":
      return "Subject";
    default:
      return "Suggestion";
  }
}

export function labelForSuggestionType(t: SuggestionType): string {
  return labelForType(t);
}

/** Merge saved prospect + To: fields so scoring tracks what the user typed. */
export function prospectToSuggestionContext(
  prospect?: { name?: string; company?: string } | null,
  extras?: { recipientName?: string; recipientCompany?: string },
): ProspectForSuggestions {
  const name =
    prospect?.name?.trim() || extras?.recipientName?.trim() || null;
  const company =
    prospect?.company?.trim() || extras?.recipientCompany?.trim() || null;
  const parts = name?.split(/\s+/).filter(Boolean) ?? [];
  return {
    company,
    first_name: parts[0] ?? null,
    last_name: parts.slice(1).join(" ") || null,
    name,
  };
}
