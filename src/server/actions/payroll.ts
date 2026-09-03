"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import dayjs from "dayjs";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth/current";
import { computeAbsenceDeduction, computeGosiDeduction, roundMoney, sumLineItems, type PayslipLineItem } from "@/lib/payroll";
import { notify } from "@/lib/notify";
import { writeAudit } from "@/lib/audit";
import { failure, type ActionResult } from "./util";

const DEFAULT_GOSI_PERCENT = 9.75; // نسبة عامة تقريبية — لا يوجد ربط حقيقي بمنصة التأمينات في هذه النسخة

async function getGosiPercent(): Promise<number> {
  const setting = await db.setting.findUnique({ where: { key: "gosi_percent" } });
  const n = setting ? Number(setting.value) : DEFAULT_GOSI_PERCENT;
  return Number.isFinite(n) ? n : DEFAULT_GOSI_PERCENT;
}

const generateSchema = z.object({
  periodYear: z.coerce.number().int().min(2020),
  periodMonth: z.coerce.number().int().min(1).max(12),
});

export async function generatePayrollRun(input: unknown): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const { periodYear, periodMonth } = generateSchema.parse(input);

    const existing = await db.payrollRun.findUnique({ where: { periodYear_periodMonth: { periodYear, periodMonth } } });
    if (existing) return { ok: false, error: "يوجد مسير رواتب لهذا الشهر بالفعل" };

    const gosiPercent = await getGosiPercent();
    const monthStart = dayjs(`${periodYear}-${String(periodMonth).padStart(2, "0")}-01`);
    const monthEnd = monthStart.endOf("month");
    const workingDays = monthEnd.date();

    const employees = await db.employee.findMany({
      where: { status: "ACTIVE" },
      include: { salaryComponents: { where: { isActive: true }, include: { component: true } } },
    });

    const payslipsData: {
      employeeId: string;
      basicSalary: number;
      totalEarnings: number;
      totalDeductions: number;
      netSalary: number;
      lineItems: PayslipLineItem[];
      absentDays: number;
    }[] = [];

    for (const emp of employees) {
      const baseSalary = Number(emp.baseSalary);
      const lineItems: PayslipLineItem[] = [{ key: "basic", nameAr: "أساسي", type: "EARNING", amount: roundMoney(baseSalary) }];

      for (const asc of emp.salaryComponents) {
        lineItems.push({
          key: asc.component.key,
          nameAr: asc.component.nameAr,
          type: asc.component.type,
          amount: roundMoney(Number(asc.amount)),
        });
      }

      const unpaidLeave = await db.leaveRequest.aggregate({
        where: {
          employeeId: emp.id,
          status: "APPROVED",
          kind: "FULL_DAY",
          leaveType: { isPaid: false },
          startDate: { gte: monthStart.toDate(), lte: monthEnd.toDate() },
        },
        _sum: { daysCount: true },
      });
      const absentDays = Number(unpaidLeave._sum.daysCount ?? 0);
      if (absentDays > 0) {
        lineItems.push({ key: "absence", nameAr: "خصم غياب", type: "DEDUCTION", amount: computeAbsenceDeduction(baseSalary, absentDays) });
      }

      if (!emp.gosiExempt) {
        lineItems.push({ key: "gosi", nameAr: "التأمينات الاجتماعية", type: "DEDUCTION", amount: computeGosiDeduction(baseSalary, gosiPercent) });
      }

      const totalEarnings = sumLineItems(lineItems, "EARNING");
      const totalDeductions = sumLineItems(lineItems, "DEDUCTION");
      payslipsData.push({
        employeeId: emp.id,
        basicSalary: roundMoney(baseSalary),
        totalEarnings,
        totalDeductions,
        netSalary: roundMoney(totalEarnings - totalDeductions),
        lineItems,
        absentDays,
      });
    }

    const totalGross = roundMoney(payslipsData.reduce((s, p) => s + p.totalEarnings, 0));
    const totalDeductions = roundMoney(payslipsData.reduce((s, p) => s + p.totalDeductions, 0));
    const totalNet = roundMoney(payslipsData.reduce((s, p) => s + p.netSalary, 0));

    const run = await db.payrollRun.create({
      data: {
        periodYear,
        periodMonth,
        generatedById: me.id,
        totalGross,
        totalDeductions,
        totalNet,
        payslips: {
          create: payslipsData.map((p) => ({
            employeeId: p.employeeId,
            basicSalary: p.basicSalary,
            totalEarnings: p.totalEarnings,
            totalDeductions: p.totalDeductions,
            netSalary: p.netSalary,
            lineItems: JSON.stringify(p.lineItems),
            workingDays,
            absentDays: p.absentDays,
          })),
        },
      },
    });

    await writeAudit({ entityName: "PayrollRun", entityId: run.id, action: "CREATE", newData: { periodYear, periodMonth, totalNet }, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true, id: run.id, count: payslipsData.length };
  } catch (e) {
    return failure(e);
  }
}

export async function approvePayrollRun(id: string): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const run = await db.payrollRun.findUnique({ where: { id } });
    if (!run || run.status !== "DRAFT") return { ok: false, error: "لا يمكن اعتماد مسير رواتب غير مسودة" };
    await db.payrollRun.update({ where: { id }, data: { status: "APPROVED", approvedById: me.id, approvedAt: new Date() } });
    await writeAudit({ entityName: "PayrollRun", entityId: id, action: "UPDATE", newData: { status: "APPROVED" }, changedBy: me.name });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

export async function markPayrollRunPaid(id: string): Promise<ActionResult> {
  try {
    const me = await requireStaff("HR_ADMIN");
    const run = await db.payrollRun.findUnique({ where: { id } });
    if (!run || run.status !== "APPROVED") return { ok: false, error: "يجب اعتماد المسير أولاً" };
    await db.payrollRun.update({ where: { id }, data: { status: "PAID", paidAt: new Date() } });
    await writeAudit({ entityName: "PayrollRun", entityId: id, action: "UPDATE", newData: { status: "PAID" }, changedBy: me.name });

    const payslips = await db.payslip.findMany({ where: { payrollRunId: id }, include: { employee: { select: { staffUserId: true } } } });
    for (const p of payslips) {
      if (p.employee.staffUserId) {
        await notify({
          staffUserId: p.employee.staffUserId,
          title: "تم صرف الراتب",
          body: `تم صرف راتبك بصافي ${Number(p.netSalary).toLocaleString("en-US")} ر.س`,
          relatedType: "payrollRun",
          relatedId: id,
        });
      }
    }

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
