import { db } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/current";
import { serialize } from "@/lib/serialize";
import PayslipsClient from "./_components/PayslipsClient";

export default async function MyPayslipsPage() {
  const session = await getStaffSession();
  const rows = await db.payslip.findMany({
    where: { employeeId: session!.employeeId! },
    include: { payrollRun: true },
    orderBy: { createdAt: "desc" },
  });
  return <PayslipsClient rows={serialize(rows)} />;
}
