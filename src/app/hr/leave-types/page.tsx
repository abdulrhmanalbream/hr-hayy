import { db } from "@/lib/db";
import LeaveTypesClient from "./_components/LeaveTypesClient";

export default async function LeaveTypesPage() {
  const rows = await db.leaveType.findMany({ orderBy: { sortOrder: "asc" } });
  return <LeaveTypesClient rows={rows} />;
}
