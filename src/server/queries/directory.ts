import "server-only";
import { db } from "@/lib/db";

export async function listEmployeesForDirectory() {
  return db.employee.findMany({
    include: {
      department: { select: { name: true } },
      jobTitle: { select: { name: true } },
      manager: { select: { fullName: true } },
      staffUser: { select: { id: true, username: true, role: true, isActive: true } },
    },
    orderBy: { employeeNo: "asc" },
  });
}

export async function getEmployeeDetail(id: string) {
  return db.employee.findUnique({
    where: { id },
    include: {
      department: true,
      jobTitle: true,
      manager: { select: { id: true, fullName: true } },
      staffUser: { select: { id: true, username: true, role: true, isActive: true, email: true } },
      documents: { include: { type: true }, orderBy: { createdAt: "desc" } },
      salaryComponents: { where: { isActive: true }, include: { component: true } },
      attendanceRecords: { orderBy: { date: "desc" }, take: 30 },
      leaveRequests: { include: { leaveType: true }, orderBy: { createdAt: "desc" }, take: 20 },
      payslips: { include: { payrollRun: true }, orderBy: { createdAt: "desc" }, take: 12 },
    },
  });
}

export async function listDepartmentOptions() {
  return db.department.findMany({ orderBy: { name: "asc" } });
}

export async function listJobTitleOptions() {
  return db.jobTitle.findMany({ orderBy: { name: "asc" } });
}

export async function listEmployeeOptions() {
  return db.employee.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, fullName: true, employeeNo: true },
    orderBy: { fullName: "asc" },
  });
}

export async function listDocumentTypeOptions() {
  return db.documentType.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } });
}

export async function listSalaryComponentOptions() {
  return db.salaryComponent.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } });
}
