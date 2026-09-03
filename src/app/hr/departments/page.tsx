import { db } from "@/lib/db";
import { listEmployeeOptions } from "@/server/queries/directory";
import DepartmentsClient from "./_components/DepartmentsClient";

export default async function DepartmentsPage() {
  const [rows, employees] = await Promise.all([
    db.department.findMany({
      include: { headEmployee: { select: { fullName: true } }, employees: { select: { id: true } } },
      orderBy: { name: "asc" },
    }),
    listEmployeeOptions(),
  ]);
  return <DepartmentsClient rows={rows} employees={employees} />;
}
