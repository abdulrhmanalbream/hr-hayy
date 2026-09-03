"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import dayjs from "dayjs";
import { db } from "@/lib/db";
import { getStaffSession, requireStaff } from "@/lib/auth/current";
import { writeAudit } from "@/lib/audit";
import { failure, type ActionResult } from "./util";

const LATE_CUTOFF_HOUR = 9; // بعد 9 صباحاً يُحتسب متأخراً — قيمة مبسّطة لهذه النسخة

/** تسجيل حضور ذاتي للموظف الحالي (زر "تسجيل حضور" في /me). */
export async function clockIn(): Promise<ActionResult> {
  try {
    const s = await getStaffSession();
    if (!s) throw new Error("UNAUTHENTICATED");
    if (!s.employeeId) return { ok: false, error: "لا يوجد سجل موظف مرتبط بحسابك" };

    const today = dayjs().startOf("day").toDate();
    const now = new Date();
    const existing = await db.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId: s.employeeId, date: today } },
    });
    if (existing?.checkIn) return { ok: false, error: "تم تسجيل الحضور اليوم بالفعل" };

    const status = now.getHours() >= LATE_CUTOFF_HOUR ? "LATE" : "PRESENT";
    const record = existing
      ? await db.attendanceRecord.update({ where: { id: existing.id }, data: { checkIn: now, status, source: "WEB" } })
      : await db.attendanceRecord.create({
          data: { employeeId: s.employeeId, date: today, checkIn: now, status, source: "WEB" },
        });

    revalidatePath("/", "layout");
    return { ok: true, id: record.id };
  } catch (e) {
    return failure(e);
  }
}

/** تسجيل انصراف ذاتي للموظف الحالي. */
export async function clockOut(): Promise<ActionResult> {
  try {
    const s = await getStaffSession();
    if (!s) throw new Error("UNAUTHENTICATED");
    if (!s.employeeId) return { ok: false, error: "لا يوجد سجل موظف مرتبط بحسابك" };

    const today = dayjs().startOf("day").toDate();
    const existing = await db.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId: s.employeeId, date: today } },
    });
    if (!existing?.checkIn) return { ok: false, error: "لم تسجّل حضورك اليوم بعد" };
    if (existing.checkOut) return { ok: false, error: "تم تسجيل الانصراف اليوم بالفعل" };

    await db.attendanceRecord.update({ where: { id: existing.id }, data: { checkOut: new Date() } });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

const manualEntrySchema = z.object({
  employeeId: z.string().min(1),
  date: z.string().min(1),
  checkIn: z.string().optional().or(z.literal("")), // "HH:mm"
  checkOut: z.string().optional().or(z.literal("")),
  status: z.enum(["PRESENT", "LATE", "ABSENT", "ON_LEAVE", "HOLIDAY", "WEEKEND"]),
  note: z.string().optional().or(z.literal("")),
});

/** إدخال/تعديل حضور يدوي من الموارد البشرية. */
export async function upsertManualAttendance(input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = manualEntrySchema.parse(input);
    const date = dayjs(data.date).startOf("day").toDate();
    const withTime = (t?: string) => (t ? dayjs(`${data.date}T${t}`).toDate() : null);

    const record = await db.attendanceRecord.upsert({
      where: { employeeId_date: { employeeId: data.employeeId, date } },
      create: {
        employeeId: data.employeeId,
        date,
        checkIn: withTime(data.checkIn),
        checkOut: withTime(data.checkOut),
        status: data.status,
        source: "MANUAL",
        note: data.note || null,
        createdById: me.id,
      },
      update: {
        checkIn: withTime(data.checkIn),
        checkOut: withTime(data.checkOut),
        status: data.status,
        source: "MANUAL",
        note: data.note || null,
        createdById: me.id,
      },
    });

    await writeAudit({ entityName: "AttendanceRecord", entityId: record.id, action: "UPDATE", newData: record, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true, id: record.id };
  } catch (e) {
    return failure(e);
  }
}
