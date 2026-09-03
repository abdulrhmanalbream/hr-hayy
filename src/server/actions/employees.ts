"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth/current";
import { writeAudit } from "@/lib/audit";
import { failure, type ActionResult } from "./util";

const employeeSchema = z.object({
  fullName: z.string().min(2, "أدخل اسم الموظف"),
  nationalId: z.string().min(5, "أدخل رقم الهوية/الإقامة"),
  nationality: z.string().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  birthDate: z.string().optional().or(z.literal("")),
  phone: z.string().min(9, "أدخل رقم الجوال"),
  email: z.string().email("بريد غير صالح").optional().or(z.literal("")),
  departmentId: z.string().min(1, "اختر القسم"),
  jobTitleId: z.string().min(1, "اختر المسمى الوظيفي"),
  managerId: z.string().optional().or(z.literal("")),
  hireDate: z.string().min(1, "أدخل تاريخ التعيين"),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACTOR"]).default("FULL_TIME"),
  status: z.enum(["ACTIVE", "ON_LEAVE", "SUSPENDED", "TERMINATED"]).default("ACTIVE"),
  iqamaExpiry: z.string().optional().or(z.literal("")),
  contractExpiry: z.string().optional().or(z.literal("")),
  bankName: z.string().optional().or(z.literal("")),
  bankIban: z.string().optional().or(z.literal("")),
  baseSalary: z.coerce.number().min(0, "الراتب لا يمكن أن يكون سالباً"),
  gosiExempt: z.boolean().default(false),
});

function toEmployeeData(data: z.infer<typeof employeeSchema>) {
  return {
    fullName: data.fullName,
    nationalId: data.nationalId.trim(),
    nationality: data.nationality || null,
    gender: data.gender,
    birthDate: data.birthDate ? new Date(data.birthDate) : null,
    phone: data.phone,
    email: data.email || null,
    departmentId: data.departmentId,
    jobTitleId: data.jobTitleId,
    managerId: data.managerId || null,
    hireDate: new Date(data.hireDate),
    employmentType: data.employmentType,
    status: data.status,
    iqamaExpiry: data.iqamaExpiry ? new Date(data.iqamaExpiry) : null,
    contractExpiry: data.contractExpiry ? new Date(data.contractExpiry) : null,
    bankName: data.bankName || null,
    bankIban: data.bankIban || null,
    baseSalary: data.baseSalary,
    gosiExempt: data.gosiExempt,
  };
}

export async function createEmployee(input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = employeeSchema.parse(input);
    const emp = await db.employee.create({ data: toEmployeeData(data) });
    await writeAudit({ entityName: "Employee", entityId: emp.id, action: "CREATE", newData: emp, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true, id: emp.id };
  } catch (e) {
    return failure(e, { P2002: "يوجد موظف مسجل بنفس رقم الهوية/الإقامة" });
  }
}

export async function updateEmployee(id: string, input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const data = employeeSchema.parse(input);
    if (data.managerId === id) return { ok: false, error: "لا يمكن أن يكون الموظف مديراً لنفسه" };
    const old = await db.employee.findUnique({ where: { id } });
    const updated = await db.employee.update({ where: { id }, data: toEmployeeData(data) });
    await writeAudit({ entityName: "Employee", entityId: id, action: "UPDATE", oldData: old, newData: updated, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true, id };
  } catch (e) {
    return failure(e, { P2002: "يوجد موظف مسجل بنفس رقم الهوية/الإقامة" });
  }
}

export async function deleteEmployee(id: string): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const [attendance, leave, payslips, reports] = await Promise.all([
      db.attendanceRecord.count({ where: { employeeId: id } }),
      db.leaveRequest.count({ where: { employeeId: id } }),
      db.payslip.count({ where: { employeeId: id } }),
      db.employee.count({ where: { managerId: id } }),
    ]);
    if (attendance > 0 || leave > 0 || payslips > 0) {
      return { ok: false, error: "لا يمكن حذف موظف له سجلات حضور أو إجازات أو رواتب — غيّر حالته إلى «منتهي الخدمة» بدلاً من الحذف" };
    }
    if (reports > 0) {
      return { ok: false, error: "لا يمكن حذف موظف هو مدير مباشر لموظفين آخرين — غيّر مديرهم أولاً" };
    }
    const old = await db.employee.findUnique({ where: { id } });
    await db.employee.delete({ where: { id } });
    await writeAudit({ entityName: "Employee", entityId: id, action: "DELETE", oldData: old, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
