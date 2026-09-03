import dayjs from "dayjs";

/** Saudi labor practice: leave is counted in calendar days (inclusive), not business days. */
export function countFullDayLeave(startDate: Date | string, endDate: Date | string): number {
  const start = dayjs(startDate).startOf("day");
  const end = dayjs(endDate).startOf("day");
  const days = end.diff(start, "day") + 1;
  return Math.max(days, 0);
}

/** "HH:mm" -> minutes since midnight. */
function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Hourly permission (مغادرة), expressed as a fraction of an 8-hour workday. */
export function countHourlyLeave(startTime: string, endTime: string): number {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  const minutes = Math.max(endMin - startMin, 0);
  const hours = minutes / 60;
  return Math.round((hours / 8) * 100) / 100;
}
