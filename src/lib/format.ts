/** Shared formatting helpers (client-safe). */

export const MONTHS_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
] as const;

export function monthLabel(year: number, month: number): string {
  return `${MONTHS_AR[month - 1]} ${year}`;
}

/** 12345.5 -> "12,345.50" (Latin digits, easier for accounting). */
export function fmtMoney(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function fmtDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return `${fmtDate(date)} ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

export function fmtTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export const ROLE_AR: Record<string, string> = {
  HR_ADMIN: "مسؤول الموارد البشرية",
  MANAGER: "مدير مباشر",
  EMPLOYEE: "موظف",
};

export const EMPLOYMENT_TYPE_AR: Record<string, string> = {
  FULL_TIME: "دوام كامل",
  PART_TIME: "دوام جزئي",
  CONTRACTOR: "متعاقد",
};

export const EMPLOYEE_STATUS_AR: Record<string, string> = {
  ACTIVE: "نشط",
  ON_LEAVE: "في إجازة",
  SUSPENDED: "موقوف",
  TERMINATED: "منتهي الخدمة",
};

export const ATTENDANCE_STATUS_AR: Record<string, string> = {
  PRESENT: "حاضر",
  LATE: "متأخر",
  ABSENT: "غائب",
  ON_LEAVE: "في إجازة",
  HOLIDAY: "عطلة رسمية",
  WEEKEND: "عطلة أسبوعية",
};

export const LEAVE_STATUS_AR: Record<string, string> = {
  PENDING: "بانتظار الاعتماد",
  APPROVED: "معتمدة",
  REJECTED: "مرفوضة",
  CANCELED: "ملغاة",
};

export const PAYROLL_STATUS_AR: Record<string, string> = {
  DRAFT: "مسودة",
  APPROVED: "معتمد",
  PAID: "مدفوع",
};

export const GENDER_AR: Record<string, string> = {
  MALE: "ذكر",
  FEMALE: "أنثى",
};
