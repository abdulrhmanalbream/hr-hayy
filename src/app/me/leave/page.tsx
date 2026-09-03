import { db } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/current";
import { serialize } from "@/lib/serialize";
import MyLeaveClient from "./_components/MyLeaveClient";

export default async function MyLeavePage() {
  const session = await getStaffSession();
  const rows = await db.leaveRequest.findMany({
    where: { employeeId: session!.employeeId! },
    include: { leaveType: { select: { nameAr: true } } },
    orderBy: { createdAt: "desc" },
  });
  return <MyLeaveClient rows={serialize(rows)} />;
}
