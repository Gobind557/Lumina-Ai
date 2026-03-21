/**
 * Rewrite API returns the model’s subject line in `body` today; `subject` is often the old draft value.
 * This picks the string the user should preview as the new subject.
 */
export function pickSuggestedSubject(
  previousSubject: string,
  suggestion?: { subject?: string; body?: string } | null,
): string | undefined {
  const prev = previousSubject.trim();
  const sub = (suggestion?.subject ?? "").trim();
  const rawBody = (suggestion?.body ?? "").trim();
  const firstLine =
    rawBody
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => l.length > 0) ?? "";

  if (sub && sub !== prev) return sub.slice(0, 500);
  if (firstLine && (sub === prev || !sub)) return firstLine.slice(0, 500);
  if (sub) return sub.slice(0, 500);
  return undefined;
}

/** Remove a leading `Subject: ...` line models sometimes put in the body. */
export function stripLeadingSubjectPrefixFromBody(text: string): string {
  if (!text) return text;
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i >= lines.length) return text.trim();
  const trimmed = lines[i].trim();
  if (/^\*{0,2}subject\*{0,2}\s*:/i.test(trimmed)) {
    i++;
    while (i < lines.length && lines[i].trim() === "") i++;
    return lines.slice(i).join("\n").trimStart();
  }
  return text.trimStart();
}
