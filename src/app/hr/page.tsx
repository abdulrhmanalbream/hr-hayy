import Grid from "@mui/material/Grid2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Link from "next/link";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { getHrDashboardStats } from "@/server/queries/dashboard";
import { fmtDate, monthLabel } from "@/lib/format";

export default async function HrDashboardPage() {
  const stats = await getHrDashboardStats();
  const alerts = [
    ...stats.expiringIqama.map((e) => ({ id: e.id, text: `إقامة «${e.fullName}» تنتهي ${fmtDate(e.iqamaExpiry)}` })),
    ...stats.expiringContracts.map((e) => ({ id: e.id, text: `عقد «${e.fullName}» ينتهي ${fmtDate(e.contractExpiry)}` })),
    ...stats.expiringDocs.map((d) => ({ id: d.id, text: `وثيقة «${d.type.labelAr}» لـ ${d.employee.fullName} تنتهي ${fmtDate(d.expiryDate)}` })),
  ];

  return (
    <Box>
      <PageHeader title="لوحة تحكم الموارد البشرية" subtitle="نظرة عامة على شؤون الموظفين" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="الموظفون النشطون" value={stats.headcount} icon={<PeopleAltRoundedIcon />} color="primary.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="الأقسام" value={stats.activeDeptCount} icon={<ApartmentRoundedIcon />} color="secondary.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="الحضور اليوم"
            value={`${stats.attendanceToday.present} / ${stats.headcount}`}
            hint={`${stats.attendanceToday.late} متأخر، ${stats.attendanceToday.onLeave} إجازة`}
            icon={<EventAvailableRoundedIcon />}
            color="#16a34a"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="طلبات بانتظار الاعتماد" value={stats.pendingLeaveCount} icon={<FactCheckRoundedIcon />} color="#E8A013" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={800}>
                  تنبيهات الانتهاء (خلال 30 يوماً)
                </Typography>
                <WarningAmberRoundedIcon color="warning" />
              </Box>
              {alerts.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  لا توجد تنبيهات حالياً
                </Typography>
              )}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {alerts.map((a) => (
                  <Box key={a.id} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, borderRadius: 2, bgcolor: "action.hover" }}>
                    <Chip size="small" color="warning" label="تنبيه" />
                    <Typography variant="body2">{a.text}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
                آخر مسير رواتب
              </Typography>
              {stats.latestRun ? (
                <>
                  <Typography variant="body2">{monthLabel(stats.latestRun.periodYear, stats.latestRun.periodMonth)}</Typography>
                  <Typography variant="h5" sx={{ mt: 0.5 }}>
                    {Number(stats.latestRun.totalNet).toLocaleString("en-US")} ر.س
                  </Typography>
                  <Chip
                    size="small"
                    sx={{ mt: 1 }}
                    label={stats.latestRun.status === "DRAFT" ? "مسودة" : stats.latestRun.status === "APPROVED" ? "معتمد" : "مدفوع"}
                    color={stats.latestRun.status === "PAID" ? "success" : stats.latestRun.status === "APPROVED" ? "info" : "default"}
                  />
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  لم يُولَّد أي مسير رواتب بعد
                </Typography>
              )}
              <Box sx={{ mt: 2 }}>
                <Button component={Link} href="/hr/payroll" variant="outlined" fullWidth>
                  عرض مسيرات الرواتب
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
