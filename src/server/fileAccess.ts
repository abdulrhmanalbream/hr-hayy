import "server-only";
import { db } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/current";

/**
 * Can the current session access this employee's files?
 * - HR_ADMIN: everything
 * - MANAGER: their direct reports' files, plus their own
 * - EMPLOYEE: only their own
 */
export async function canAccessEmployeeFiles(employeeId: string): Promise<boolean> {
  const s = await getStaffSession();
  if (!s) return false;
  if (s.role === "HR_ADMIN") return true;
  if (s.employeeId === employeeId) return true;
  if (s.role === "MANAGER" && s.employeeId) {
    const employee = await db.employee.findUnique({ where: { id: employeeId }, select: { managerId: true } });
    return employee?.managerId === s.employeeId;
  }
  return false;
}

/** ASCII-safe + UTF-8 encoded Content-Disposition for Arabic filenames. */
export function contentDisposition(filename: string, inline = false): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
  const encoded = encodeURIComponent(filename);
  return `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}
