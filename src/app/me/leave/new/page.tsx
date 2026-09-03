import { db } from "@/lib/db";
import NewLeaveRequestForm from "./_components/NewLeaveRequestForm";

export default async function NewLeaveRequestPage() {
  const leaveTypes = await db.leaveType.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } });
  return <NewLeaveRequestForm leaveTypes={leaveTypes} />;
}
