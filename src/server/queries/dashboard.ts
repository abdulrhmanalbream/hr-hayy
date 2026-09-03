import "server-only";
import dayjs from "dayjs";
import { db } from "@/lib/db";

const DOC_SOON_DAYS = 30;

export async function getHrDashboardStats() {
  const today = dayjs().startOf("day").toDate();
  const soon = dayjs().add(DOC_SOON_DAYS, "day").toDate();
  const now = new Date();

  const [headcount, todayRecords, pendingLeaveCount, expiringDocs, expiringIqama, expiringContracts, activeDeptCount, latestRun] =
    await Promise.all([
      db.employee.count({ where: { status: "ACTIVE" } }),
      db.attendanceRecord.findMany({ where: { date: today }, select: { status: true } }),
      db.leaveRequest.count({ where: { status: "PENDING" } }),
      db.document.findMany({
        where: { expiryDate: { gte: now, lte: soon } },
        include: { employee: { select: { fullName: true } }, type: { select: { labelAr: true } } },
        orderBy: { expiryDate: "asc" },
        take: 10,
      }),
      db.employee.findMany({
        where: { status: "ACTIVE", iqamaExpiry: { gte: now, lte: soon } },
        select: { id: true, fullName: true, iqamaExpiry: true },
        orderBy: { iqamaExpiry: "asc" },
      }),
      db.employee.findMany({
        where: { status: "ACTIVE", contractExpiry: { gte: now, lte: soon } },
        select: { id: true, fullName: true, contractExpiry: true },
        orderBy: { contractExpiry: "asc" },
      }),
      db.department.count(),
      db.payrollRun.findFirst({ orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }] }),
    ]);

  const present = todayRecords.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const late = todayRecords.filter((r) => r.status === "LATE").length;
  const onLeave = todayRecords.filter((r) => r.status === "ON_LEAVE").length;
  const absent = Math.max(headcount - todayRecords.length, 0);

  return {
    headcount,
    activeDeptCount,
    attendanceToday: { present, late, onLeave, absent },
    pendingLeaveCount,
    expiringDocs,
    expiringIqama,
    expiringContracts,
    latestRun,
  };
}

export async function getManagerDashboardStats(managerEmployeeId: string) {
  const today = dayjs().startOf("day").toDate();
  const [teamSize, pendingRequests, todayRecords] = await Promise.all([
    db.employee.count({ where: { managerId: managerEmployeeId, status: "ACTIVE" } }),
    db.leaveRequest.findMany({
      where: { status: "PENDING", employee: { managerId: managerEmployeeId } },
      include: { employee: { select: { fullName: true } }, leaveType: { select: { nameAr: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.attendanceRecord.findMany({
      where: { date: today, employee: { managerId: managerEmployeeId } },
      include: { employee: { select: { fullName: true } } },
    }),
  ]);

  return { teamSize, pendingRequests, todayRecords };
}

export async function getMeDashboardStats(employeeId: string) {
  const today = dayjs().startOf("day").toDate();
  const year = dayjs().year();

  const [todayRecord, leaveTypes, myLeaveRequests, latestPayslip] = await Promise.all([
    db.attendanceRecord.findUnique({ where: { employeeId_date: { employeeId, date: today } } }),
    db.leaveType.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } }),
    db.leaveRequest.findMany({
      where: { employeeId, status: "APPROVED", startDate: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) } },
      select: { leaveTypeId: true, daysCount: true },
    }),
    db.payslip.findFirst({ where: { employeeId }, orderBy: { createdAt: "desc" }, include: { payrollRun: true } }),
  ]);

  const usedByType = new Map<string, number>();
  for (const r of myLeaveRequests) {
    usedByType.set(r.leaveTypeId, (usedByType.get(r.leaveTypeId) ?? 0) + Number(r.daysCount));
  }
  const balances = leaveTypes.map((lt) => ({
    leaveTypeId: lt.id,
    nameAr: lt.nameAr,
    annualDays: lt.annualDays,
    used: usedByType.get(lt.id) ?? 0,
    remaining: lt.annualDays != null ? lt.annualDays - (usedByType.get(lt.id) ?? 0) : null,
  }));

  return { todayRecord, balances, latestPayslip };
}
