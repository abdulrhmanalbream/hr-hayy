"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth/current";
import { writeAudit } from "@/lib/audit";
import { failure, type ActionResult } from "./util";

const leaveTypeSchema = z.object({
  key: z.string().min(2, "أدخل مفتاح النوع (بالإنجليزية، بدون مسافات)"),
  nameAr: z.string().min(2, "أدخل اسم نوع الإجازة"),
  annualDays: z.coerce.number().int().min(0).optional().nullable(),
  isPaid: z.boolean().default(true),
  requiresAttachment: z.boolean().default(false),
  enabled: z.boolean().default(true),
});

export async function createLeaveType(input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = leaveTypeSchema.parse(input);
    const lt = await db.leaveType.create({ data: { ...data, key: data.key.trim() } });
    await writeAudit({ entityName: "LeaveType", entityId: lt.id, action: "CREATE", newData: lt, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true, id: lt.id };
  } catch (e) {
    return failure(e, { P2002: "يوجد نوع إجازة بنفس المفتاح" });
  }
}

export async function updateLeaveType(id: string, input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = leaveTypeSchema.partial().parse(input);
    const old = await db.leaveType.findUnique({ where: { id } });
    const updated = await db.leaveType.update({ where: { id }, data });
    await writeAudit({ entityName: "LeaveType", entityId: id, action: "UPDATE", oldData: old, newData: updated, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true, id };
  } catch (e) {
    return failure(e);
  }
}

export async function deleteLeaveType(id: string): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const count = await db.leaveRequest.count({ where: { leaveTypeId: id } });
    if (count > 0) return { ok: false, error: "لا يمكن حذف نوع إجازة له طلبات مسجّلة — عطّله بدلاً من ذلك" };
    const old = await db.leaveType.findUnique({ where: { id } });
    await db.leaveType.delete({ where: { id } });
    await writeAudit({ entityName: "LeaveType", entityId: id, action: "DELETE", oldData: old, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
