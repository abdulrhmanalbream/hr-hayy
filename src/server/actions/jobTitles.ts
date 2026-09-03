"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth/current";
import { writeAudit } from "@/lib/audit";
import { failure, type ActionResult } from "./util";

const jobTitleSchema = z.object({ name: z.string().min(2, "أدخل المسمى الوظيفي") });

export async function createJobTitle(input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = jobTitleSchema.parse(input);
    const jt = await db.jobTitle.create({ data });
    await writeAudit({ entityName: "JobTitle", entityId: jt.id, action: "CREATE", newData: jt, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true, id: jt.id };
  } catch (e) {
    return failure(e);
  }
}

export async function updateJobTitle(id: string, input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = jobTitleSchema.parse(input);
    const old = await db.jobTitle.findUnique({ where: { id } });
    const updated = await db.jobTitle.update({ where: { id }, data });
    await writeAudit({ entityName: "JobTitle", entityId: id, action: "UPDATE", oldData: old, newData: updated, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true, id };
  } catch (e) {
    return failure(e);
  }
}

export async function deleteJobTitle(id: string): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const count = await db.employee.count({ where: { jobTitleId: id } });
    if (count > 0) return { ok: false, error: "لا يمكن حذف مسمى وظيفي مرتبط بموظفين" };
    const old = await db.jobTitle.findUnique({ where: { id } });
    await db.jobTitle.delete({ where: { id } });
    await writeAudit({ entityName: "JobTitle", entityId: id, action: "DELETE", oldData: old, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
