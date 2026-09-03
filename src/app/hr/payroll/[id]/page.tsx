import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import { db } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import Money from "@/components/Money";
import { monthLabel, PAYROLL_STATUS_AR } from "@/lib/format";
import { serialize } from "@/lib/serialize";
import PayrollRunActions from "./_components/PayrollRunActions";
import PayslipsTable from "./_components/PayslipsTable";

export default async function PayrollRunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await db.payrollRun.findUnique({
    where: { id },
    include: { payslips: { include: { employee: { select: { fullName: true, employeeNo: true } } } } },
  });
  if (!run) notFound();

  return (
    <Box>
      <PageHeader
        title={`مسير رواتب ${monthLabel(run.periodYear, run.periodMonth)}`}
        subtitle={PAYROLL_STATUS_AR[run.status]}
        action={<PayrollRunActions id={run.id} status={run.status} />}
      />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="إجمالي المستحقات" value={<Money value={run.totalGross.toString()} />} color="#16a34a" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="إجمالي الخصومات" value={<Money value={run.totalDeductions.toString()} />} color="#C62828" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="الصافي" value={<Money value={run.totalNet.toString()} />} color="primary.main" />
        </Grid>
      </Grid>
      <PayslipsTable rows={serialize(run.payslips)} />
    </Box>
  );
}
