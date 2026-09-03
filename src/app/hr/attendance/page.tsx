import dayjs from "dayjs";
import { db } from "@/lib/db";
import { listEmployeeOptions } from "@/server/queries/directory";
import AttendanceClient from "./_components/AttendanceClient";

export default async function AttendancePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date: dateParam } = await searchParams;
  const date = dateParam || dayjs().format("YYYY-MM-DD");

  const [rows, employees] = await Promise.all([
    db.attendanceRecord.findMany({
      where: { date: dayjs(date).startOf("day").toDate() },
      include: { employee: { select: { fullName: true } } },
      orderBy: { employee: { fullName: "asc" } },
    }),
    listEmployeeOptions(),
  ]);

  return <AttendanceClient rows={rows} date={date} employees={employees} />;
}
