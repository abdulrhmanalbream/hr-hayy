import { db } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/current";
import MyAttendanceTable from "./_components/MyAttendanceTable";

export default async function MyAttendancePage() {
  const session = await getStaffSession();
  const rows = await db.attendanceRecord.findMany({
    where: { employeeId: session!.employeeId! },
    orderBy: { date: "desc" },
    take: 90,
  });

  return <MyAttendanceTable rows={rows} />;
}
