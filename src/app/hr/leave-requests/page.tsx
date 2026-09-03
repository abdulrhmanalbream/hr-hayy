import Box from "@mui/material/Box";
import PageHeader from "@/components/PageHeader";
import LeaveRequestsTable from "@/components/hr/LeaveRequestsTable";
import { db } from "@/lib/db";
import { serialize } from "@/lib/serialize";

export default async function LeaveRequestsPage() {
  const rows = await db.leaveRequest.findMany({
    include: { employee: { select: { fullName: true } }, leaveType: { select: { nameAr: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <Box>
      <PageHeader title="طلبات الإجازة" subtitle="كل طلبات الإجازات والمغادرات في الشركة" />
      <LeaveRequestsTable rows={serialize(rows)} />
    </Box>
  );
}
