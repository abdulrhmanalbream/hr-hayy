"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth/current";
import { writeAudit } from "@/lib/audit";
import { failure, type ActionResult } from "./util";

const departmentSchema = z.object({
  name: z.string().min(2, "أدخل اسم القسم"),
  parentId: z.string().optional().nullable(),
  headEmployeeId: z.string().optional().nullable(),
});

export async function createDepartment(input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = departmentSchema.parse(input);
    const dept = await db.department.create({
      data: { name: data.name, parentId: data.parentId || null, headEmployeeId: data.headEmployeeId || null },
    });
    await writeAudit({ entityName: "Department", entityId: dept.id, action: "CREATE", newData: dept, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true, id: dept.id };
  } catch (e) {
    return failure(e);
  }
}

export async function updateDepartment(id: string, input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = departmentSchema.parse(input);
    const old = await db.department.findUnique({ where: { id } });
    const updated = await db.department.update({
      where: { id },
      data: { name: data.name, parentId: data.parentId || null, headEmployeeId: data.headEmployeeId || null },
    });
    await writeAudit({ entityName: "Department", entityId: id, action: "UPDATE", oldData: old, newData: updated, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true, id };
  } catch (e) {
    return failure(e);
  }
}

export async function deleteDepartment(id: string): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const employeeCount = await db.employee.count({ where: { departmentId: id } });
    if (employeeCount > 0) {
      return { ok: false, error: "لا يمكن حذف قسم يضم موظفين — انقلهم لقسم آخر أولاً" };
    }
    const old = await db.department.findUnique({ where: { id } });
    await db.department.delete({ where: { id } });
    await writeAudit({ entityName: "Department", entityId: id, action: "DELETE", oldData: old, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e, { P2003: "لا يمكن حذف قسم له أقسام فرعية — احذفها أولاً" });
  }
}
