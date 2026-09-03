import Box from "@mui/material/Box";
import PageHeader from "@/components/PageHeader";
import LeaveRequestsTable from "@/components/hr/LeaveRequestsTable";
import { getStaffSession } from "@/lib/auth/current";
import { listTeamLeaveRequests } from "@/server/queries/team";
import { serialize } from "@/lib/serialize";

export default async function LeaveApprovalsPage() {
  const session = await getStaffSession();
  const rows = await listTeamLeaveRequests(session!.employeeId!);

  return (
    <Box>
      <PageHeader title="اعتماد الإجازات" subtitle="طلبات إجازات فريقك" />
      <LeaveRequestsTable rows={serialize(rows)} />
    </Box>
  );
}
