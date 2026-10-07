export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayStr(): string {
  return toDateInputValue(new Date());
}

// "2026-10-06" -> "Tuesday, October 6" (built from parts so the time zone cannot shift the day)
export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export const userTimeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export function localNoonIso(day: string): string {
  return new Date(`${day}T12:00:00`).toISOString();
}
