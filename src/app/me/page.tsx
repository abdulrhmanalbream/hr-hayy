import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import PageHeader from "@/components/PageHeader";
import Money from "@/components/Money";
import { getStaffSession } from "@/lib/auth/current";
import { getMeDashboardStats } from "@/server/queries/dashboard";
import { monthLabel } from "@/lib/format";
import CheckInOutCard from "./_components/CheckInOutCard";

export default async function MeDashboardPage() {
  const session = await getStaffSession();
  const stats = await getMeDashboardStats(session!.employeeId!);

  return (
    <Box>
      <PageHeader title={`مرحباً ${session!.name} 👋`} subtitle="نظرة عامة على حسابك" />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <CheckInOutCard record={stats.todayRecord} />
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
                رصيد الإجازات
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {stats.balances.map((b) => (
                  <Box key={b.leaveTypeId} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Typography variant="body2">{b.nameAr}</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {b.remaining != null ? `${b.remaining} / ${b.annualDays} يوم` : `${b.used} يوم مستخدم`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
                آخر قسيمة راتب
              </Typography>
              {stats.latestPayslip ? (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2">{monthLabel(stats.latestPayslip.payrollRun.periodYear, stats.latestPayslip.payrollRun.periodMonth)}</Typography>
                  <Money value={stats.latestPayslip.netSalary.toString()} className="" />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  لا توجد قسائم رواتب بعد
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
