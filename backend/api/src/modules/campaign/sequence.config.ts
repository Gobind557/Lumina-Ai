/**
 * Static sequence definition for campaign step execution.
 * step: 1-based step number; delayDays: days to wait before sending that step (0 = immediate).
 * Used to schedule the next email via BullMQ delayed jobs after each EMAIL_SENT.
 */
export const SEQUENCE = [
  { step: 1, delayDays: 0 },
  { step: 2, delayDays: 3 },
  { step: 3, delayDays: 5 },
  { step: 4, delayDays: 7 },
  { step: 5, delayDays: 10 },
] as const;

export const SEQUENCE_MAX_STEP = SEQUENCE.length;

/** Delay in ms for a given step (1-based). Returns undefined if step is not in SEQUENCE. */
export function getDelayMsForStep(step: number): number | undefined {
  const entry = SEQUENCE.find((s) => s.step === step);
  if (!entry) return undefined;
  return entry.delayDays * 24 * 60 * 60 * 1000;
}
