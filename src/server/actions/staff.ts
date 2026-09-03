"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth/current";
import { hashPassword } from "@/lib/auth/passwords";
import { writeAudit } from "@/lib/audit";
import { failure, type ActionResult } from "./util";

const createLoginSchema = z.object({
  employeeId: z.string().min(1),
  username: z.string().min(3, "اسم المستخدم قصير جداً"),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
  role: z.enum(["HR_ADMIN", "MANAGER", "EMPLOYEE"]).default("EMPLOYEE"),
  email: z.string().email("بريد غير صالح").optional().or(z.literal("")),
});

/** Creates a login account for an already-existing Employee record and links them. */
export async function createLoginForEmployee(input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = createLoginSchema.parse(input);
    const employee = await db.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) return { ok: false, error: "الموظف غير موجود" };
    if (employee.staffUserId) return { ok: false, error: "يوجد حساب دخول لهذا الموظف بالفعل" };

    const user = await db.staffUser.create({
      data: {
        username: data.username.trim(),
        name: employee.fullName,
        phone: employee.phone,
        email: data.email || employee.email,
        passwordHash: hashPassword(data.password),
        role: data.role,
      },
    });
    await db.employee.update({ where: { id: employee.id }, data: { staffUserId: user.id } });
    await writeAudit({ entityName: "StaffUser", entityId: user.id, action: "CREATE", newData: { ...user, passwordHash: undefined }, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true, id: user.id };
  } catch (e) {
    return failure(e, { P2002: "اسم المستخدم مستخدم بالفعل" });
  }
}

const roleSchema = z.object({ role: z.enum(["HR_ADMIN", "MANAGER", "EMPLOYEE"]) });

export async function updateStaffRole(staffUserId: string, input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = roleSchema.parse(input);
    const old = await db.staffUser.findUnique({ where: { id: staffUserId } });
    const updated = await db.staffUser.update({ where: { id: staffUserId }, data: { role: data.role } });
    await writeAudit({ entityName: "StaffUser", entityId: staffUserId, action: "UPDATE", oldData: old, newData: updated, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

export async function setStaffActive(staffUserId: string, isActive: boolean): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    await db.staffUser.update({ where: { id: staffUserId }, data: { isActive } });
    await writeAudit({ entityName: "StaffUser", entityId: staffUserId, action: "UPDATE", newData: { isActive }, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

const emailSchema = z.object({ email: z.string().email("بريد غير صالح").optional().or(z.literal("")) });

/** يسمح بربط بريد Google بحساب الدخول — بدونه لا يعمل "تسجيل الدخول عبر Google" لهذا المستخدم. */
export async function updateStaffEmail(staffUserId: string, input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = emailSchema.parse(input);
    const old = await db.staffUser.findUnique({ where: { id: staffUserId } });
    const updated = await db.staffUser.update({ where: { id: staffUserId }, data: { email: data.email || null } });
    await writeAudit({ entityName: "StaffUser", entityId: staffUserId, action: "UPDATE", oldData: old, newData: updated, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e, { P2002: "هذا البريد مستخدم بحساب آخر" });
  }
}

const resetPasswordSchema = z.object({ password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل") });

export async function resetStaffPassword(staffUserId: string, input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = resetPasswordSchema.parse(input);
    await db.staffUser.update({ where: { id: staffUserId }, data: { passwordHash: hashPassword(data.password) } });
    await writeAudit({ entityName: "StaffUser", entityId: staffUserId, action: "UPDATE", newData: { passwordReset: true }, changedBy: me.name });
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
