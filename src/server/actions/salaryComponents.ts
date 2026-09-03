"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth/current";
import { writeAudit } from "@/lib/audit";
import { failure, type ActionResult } from "./util";

const componentSchema = z.object({
  key: z.string().min(2, "أدخل مفتاح العنصر (بالإنجليزية، بدون مسافات)"),
  nameAr: z.string().min(2, "أدخل اسم عنصر الراتب"),
  type: z.enum(["EARNING", "DEDUCTION"]),
  isRecurring: z.boolean().default(true),
  enabled: z.boolean().default(true),
});

export async function createSalaryComponent(input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = componentSchema.parse(input);
    const c = await db.salaryComponent.create({ data: { ...data, key: data.key.trim() } });
    await writeAudit({ entityName: "SalaryComponent", entityId: c.id, action: "CREATE", newData: c, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true, id: c.id };
  } catch (e) {
    return failure(e, { P2002: "يوجد عنصر راتب بنفس المفتاح" });
  }
}

export async function updateSalaryComponent(id: string, input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = componentSchema.partial().parse(input);
    const old = await db.salaryComponent.findUnique({ where: { id } });
    if (old?.isSystem && data.type && data.type !== old.type) {
      return { ok: false, error: "لا يمكن تغيير نوع عنصر نظامي" };
    }
    const updated = await db.salaryComponent.update({ where: { id }, data });
    await writeAudit({ entityName: "SalaryComponent", entityId: id, action: "UPDATE", oldData: old, newData: updated, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true, id };
  } catch (e) {
    return failure(e);
  }
}

export async function deleteSalaryComponent(id: string): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const existing = await db.salaryComponent.findUnique({ where: { id } });
    if (existing?.isSystem) return { ok: false, error: "لا يمكن حذف عنصر راتب نظامي" };
    const count = await db.employeeSalaryComponent.count({ where: { componentId: id } });
    if (count > 0) return { ok: false, error: "لا يمكن حذف عنصر مرتبط بموظفين — عطّله بدلاً من ذلك" };
    await db.salaryComponent.delete({ where: { id } });
    await writeAudit({ entityName: "SalaryComponent", entityId: id, action: "DELETE", oldData: existing, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

const assignSchema = z.object({
  employeeId: z.string().min(1),
  componentId: z.string().min(1),
  amount: z.coerce.number().min(0, "المبلغ لا يمكن أن يكون سالباً"),
});

export async function assignEmployeeSalaryComponent(input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = assignSchema.parse(input);
    const row = await db.employeeSalaryComponent.upsert({
      where: { employeeId_componentId: { employeeId: data.employeeId, componentId: data.componentId } },
      create: { ...data, isActive: true },
      update: { amount: data.amount, isActive: true },
    });
    await writeAudit({ entityName: "EmployeeSalaryComponent", entityId: row.id, action: "UPDATE", newData: row, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true, id: row.id };
  } catch (e) {
    return failure(e);
  }
}

export async function removeEmployeeSalaryComponent(id: string): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    await db.employeeSalaryComponent.update({ where: { id }, data: { isActive: false } });
    await writeAudit({ entityName: "EmployeeSalaryComponent", entityId: id, action: "DELETE", changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
