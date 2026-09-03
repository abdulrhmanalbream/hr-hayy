"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getStaffSession, requireStaff } from "@/lib/auth/current";
import { countFullDayLeave, countHourlyLeave } from "@/lib/leave";
import { notify } from "@/lib/notify";
import { writeAudit } from "@/lib/audit";
import { failure, type ActionResult } from "./util";

const submitSchema = z
  .object({
    leaveTypeId: z.string().min(1, "اختر نوع الإجازة"),
    kind: z.enum(["FULL_DAY", "HOURLY"]).default("FULL_DAY"),
    startDate: z.string().min(1, "أدخل تاريخ البداية"),
    endDate: z.string().min(1, "أدخل تاريخ النهاية"),
    startTime: z.string().optional().or(z.literal("")),
    endTime: z.string().optional().or(z.literal("")),
    reason: z.string().min(3, "اذكر سبب الطلب"),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
    path: ["endDate"],
  });

/** يقدّمها الموظف عن نفسه فقط — الرصيد يُحسب من الطلبات المعتمدة، لا يُخزّن. */
export async function submitLeaveRequest(input: unknown): Promise<ActionResult> {
  try {
    const s = await getStaffSession();
    if (!s) throw new Error("UNAUTHENTICATED");
    if (!s.employeeId) return { ok: false, error: "لا يوجد سجل موظف مرتبط بحسابك" };

    const data = submitSchema.parse(input);
    const leaveType = await db.leaveType.findUnique({ where: { id: data.leaveTypeId } });
    if (!leaveType || !leaveType.enabled) return { ok: false, error: "نوع الإجازة غير متاح" };
    if (leaveType.requiresAttachment) {
      // مرفقات لاحقاً — لا نمنع الإرسال في هذه النسخة، فقط الحقول الأساسية.
    }

    const daysCount =
      data.kind === "HOURLY"
        ? countHourlyLeave(data.startTime || "00:00", data.endTime || "00:00")
        : countFullDayLeave(data.startDate, data.endDate);
    if (daysCount <= 0) return { ok: false, error: "المدة المحسوبة للطلب غير صالحة" };

    if (leaveType.annualDays != null) {
      const year = new Date(data.startDate).getFullYear();
      const used = await db.leaveRequest.aggregate({
        where: {
          employeeId: s.employeeId,
          leaveTypeId: leaveType.id,
          status: "APPROVED",
          startDate: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) },
        },
        _sum: { daysCount: true },
      });
      const remaining = leaveType.annualDays - Number(used._sum.daysCount ?? 0);
      if (daysCount > remaining) {
        return { ok: false, error: `رصيدك المتبقي من «${leaveType.nameAr}» هذا العام هو ${remaining} يوم فقط` };
      }
    }

    const employee = await db.employee.findUnique({ where: { id: s.employeeId }, include: { manager: { select: { staffUserId: true, fullName: true } } } });

    const request = await db.leaveRequest.create({
      data: {
        employeeId: s.employeeId,
        leaveTypeId: leaveType.id,
        kind: data.kind,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        startTime: data.kind === "HOURLY" ? data.startTime || null : null,
        endTime: data.kind === "HOURLY" ? data.endTime || null : null,
        daysCount,
        reason: data.reason,
      },
    });

    // نبّه المدير المباشر إن كان لديه حساب دخول، وإلا كل مسؤولي الموارد البشرية.
    const recipients = employee?.manager?.staffUserId
      ? [employee.manager.staffUserId]
      : (await db.staffUser.findMany({ where: { role: "HR_ADMIN" }, select: { id: true } })).map((u) => u.id);
    for (const staffUserId of recipients) {
      await notify({
        staffUserId,
        title: "طلب إجازة جديد",
        body: `${employee?.fullName ?? "موظف"} قدّم طلب «${leaveType.nameAr}» بتاريخ ${data.startDate}`,
        relatedType: "leaveRequest",
        relatedId: request.id,
      });
    }

    revalidatePath("/", "layout");
    return { ok: true, id: request.id };
  } catch (e) {
    return failure(e);
  }
}

async function assertCanReview(requestId: string) {
  const s = await requireStaff("HR_ADMIN", "MANAGER");
  const request = await db.leaveRequest.findUnique({
    where: { id: requestId },
    include: { employee: { select: { managerId: true, fullName: true, staffUserId: true } }, leaveType: true },
  });
  if (!request) throw new Error("طلب الإجازة غير موجود");
  if (s.role !== "HR_ADMIN" && request.employee.managerId !== s.employeeId) {
    throw new Error("FORBIDDEN");
  }
  return { s, request };
}

const rejectSchema = z.object({ rejectionNote: z.string().min(3, "اذكر سبب الرفض") });

export async function approveLeaveRequest(id: string): Promise<ActionResult> {
  try {
    const { s, request } = await assertCanReview(id);
    if (request.status !== "PENDING") return { ok: false, error: "لا يمكن اعتماد طلب تم البت فيه بالفعل" };

    const updated = await db.leaveRequest.update({
      where: { id },
      data: { status: "APPROVED", approverId: s.id, approvedAt: new Date() },
    });
    await writeAudit({ entityName: "LeaveRequest", entityId: id, action: "UPDATE", newData: updated, changedBy: s.name });
    if (request.employee.staffUserId) {
      await notify({
        staffUserId: request.employee.staffUserId,
        title: "تم اعتماد طلب الإجازة",
        body: `تم اعتماد طلب «${request.leaveType.nameAr}» الخاص بك`,
        relatedType: "leaveRequest",
        relatedId: id,
      });
    }
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

export async function rejectLeaveRequest(id: string, input: unknown): Promise<ActionResult> {
  try {
    const { s, request } = await assertCanReview(id);
    if (request.status !== "PENDING") return { ok: false, error: "لا يمكن رفض طلب تم البت فيه بالفعل" };
    const data = rejectSchema.parse(input);

    const updated = await db.leaveRequest.update({
      where: { id },
      data: { status: "REJECTED", approverId: s.id, approvedAt: new Date(), rejectionNote: data.rejectionNote },
    });
    await writeAudit({ entityName: "LeaveRequest", entityId: id, action: "UPDATE", newData: updated, changedBy: s.name });
    if (request.employee.staffUserId) {
      await notify({
        staffUserId: request.employee.staffUserId,
        title: "تم رفض طلب الإجازة",
        body: `تم رفض طلب «${request.leaveType.nameAr}»: ${data.rejectionNote}`,
        relatedType: "leaveRequest",
        relatedId: id,
      });
    }
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

export async function cancelLeaveRequest(id: string): Promise<ActionResult> {
  try {
    const s = await getStaffSession();
    if (!s) throw new Error("UNAUTHENTICATED");
    const request = await db.leaveRequest.findUnique({ where: { id } });
    if (!request || request.employeeId !== s.employeeId) throw new Error("FORBIDDEN");
    if (request.status !== "PENDING") return { ok: false, error: "لا يمكن إلغاء طلب تم البت فيه بالفعل" };
    await db.leaveRequest.update({ where: { id }, data: { status: "CANCELED" } });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
