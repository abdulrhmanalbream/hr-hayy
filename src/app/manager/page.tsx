import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import LeaveRequestsTable from "@/components/hr/LeaveRequestsTable";
import { getStaffSession } from "@/lib/auth/current";
import { getManagerDashboardStats } from "@/server/queries/dashboard";
import { ATTENDANCE_STATUS_AR } from "@/lib/format";
import { serialize } from "@/lib/serialize";

export default async function ManagerDashboardPage() {
  const session = await getStaffSession();
  const stats = await getManagerDashboardStats(session!.employeeId!);

  return (
    <Box>
      <PageHeader title={`مرحباً ${session!.name}`} subtitle="نظرة عامة على فريقك" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="أعضاء الفريق" value={stats.teamSize} icon={<GroupsRoundedIcon />} color="primary.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="طلبات بانتظار اعتمادك" value={stats.pendingRequests.length} icon={<FactCheckRoundedIcon />} color="#E8A013" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="حاضرون اليوم" value={stats.todayRecords.length} icon={<EventAvailableRoundedIcon />} color="#16a34a" />
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
            طلبات بانتظار اعتمادك
          </Typography>
          {stats.pendingRequests.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              لا توجد طلبات بانتظار الاعتماد
            </Typography>
          ) : (
            <LeaveRequestsTable rows={serialize(stats.pendingRequests)} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
            حضور الفريق اليوم
          </Typography>
          {stats.todayRecords.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              لا توجد سجلات حضور اليوم بعد
            </Typography>
          )}
          {stats.todayRecords.map((r) => (
            <Box key={r.id} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="body2">{r.employee.fullName}</Typography>
              <Chip size="small" label={ATTENDANCE_STATUS_AR[r.status]} />
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}
