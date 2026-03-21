/** Monday–Friday */
function isWeekday(d: Date): boolean {
  const day = d.getDay();
  return day >= 1 && day <= 5;
}

/**
 * Next weekday morning slot (default 9:30 local) after `now`.
 * Used for “Schedule send” helper text — not a real scheduler yet.
 */
export function nextOptimalSendSlot(
  now = new Date(),
  hour = 9,
  minute = 30,
): Date {
  let d = new Date(now);
  d.setHours(hour, minute, 0, 0);

  for (let i = 0; i < 14; i++) {
    if (isWeekday(d) && d.getTime() > now.getTime()) {
      return d;
    }
    d.setDate(d.getDate() + 1);
    d.setHours(hour, minute, 0, 0);
  }
  return d;
}

/** e.g. "Best time: Today 9:30 AM" / "Tomorrow …" / "Mon, Mar 24 …" */
export function formatBestSendTimeHint(now = new Date()): string {
  const slot = nextOptimalSendSlot(now);
  const timeStr = slot.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  const startOf = (x: Date) => {
    const t = new Date(x);
    t.setHours(0, 0, 0, 0);
    return t.getTime();
  };

  const diffDays = Math.round(
    (startOf(slot) - startOf(now)) / 86_400_000,
  );

  if (diffDays === 0) {
    return `Best time: Today ${timeStr}`;
  }
  if (diffDays === 1) {
    return `Best time: Tomorrow ${timeStr}`;
  }

  const datePart = slot.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `Best time: ${datePart}, ${timeStr}`;
}
