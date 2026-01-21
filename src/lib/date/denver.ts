export function denverTodayISODate(): string {
  // Returns YYYY-MM-DD for America/Denver, regardless of server timezone.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const y = parts.find(p => p.type === "year")?.value;
  const m = parts.find(p => p.type === "month")?.value;
  const d = parts.find(p => p.type === "day")?.value;

  if (!y || !m || !d) throw new Error("Failed to compute Denver date");
  return `${y}-${m}-${d}`;
}
