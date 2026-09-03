"use server";
import { db } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/current";

/** Bootstrap data for the quick-action hub forms — kept to a single round trip. */
export async function getQuickActionsBootstrapData() {
  const [departments, jobTitles, leaveTypes] = await Promise.all([
    db.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.jobTitle.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.leaveType.findMany({ where: { enabled: true }, select: { id: true, nameAr: true, annualDays: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return { departments, jobTitles, leaveTypes };
}

export async function getMyTodayAttendanceStatus() {
  const s = await getStaffSession();
  if (!s?.employeeId) return { checkedIn: false, checkedOut: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const record = await db.attendanceRecord.findUnique({
    where: { employeeId_date: { employeeId: s.employeeId, date: today } },
  });
  return { checkedIn: Boolean(record?.checkIn), checkedOut: Boolean(record?.checkOut) };
}
