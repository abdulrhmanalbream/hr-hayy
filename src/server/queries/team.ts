import "server-only";
import { db } from "@/lib/db";

export async function listMyTeam(managerEmployeeId: string) {
  return db.employee.findMany({
    where: { managerId: managerEmployeeId },
    select: {
      id: true,
      fullName: true,
      phone: true,
      status: true,
      department: { select: { name: true } },
      jobTitle: { select: { name: true } },
    },
    orderBy: { fullName: "asc" },
  });
}

export async function listTeamLeaveRequests(managerEmployeeId: string) {
  return db.leaveRequest.findMany({
    where: { employee: { managerId: managerEmployeeId } },
    include: { employee: { select: { fullName: true } }, leaveType: { select: { nameAr: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
