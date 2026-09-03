import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { db } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/current";
import { monthLabel } from "@/lib/format";
import PrintButton from "./_components/PrintButton";
import type { PayslipLineItem } from "@/lib/payroll";

export default async function PayslipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getStaffSession();
  const payslip = await db.payslip.findUnique({
    where: { id },
    include: { payrollRun: true, employee: { select: { fullName: true, employeeNo: true, staffUserId: true } } },
  });
  if (!payslip || payslip.employee.staffUserId !== session!.id) notFound();

  const lineItems: PayslipLineItem[] = JSON.parse(payslip.lineItems);
  const earnings = lineItems.filter((i) => i.type === "EARNING");
  const deductions = lineItems.filter((i) => i.type === "DEDUCTION");

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      <Box className="no-print" sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <PrintButton />
      </Box>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={800} align="center">
            قسيمة راتب
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            {monthLabel(payslip.payrollRun.periodYear, payslip.payrollRun.periodMonth)}
          </Typography>

          <Row label="الموظف" value={payslip.employee.fullName} />
          <Row label="الرقم الوظيفي" value={String(payslip.employee.employeeNo)} />
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            المستحقات
          </Typography>
          {earnings.map((i) => (
            <Row key={i.key} label={i.nameAr} value={`${i.amount.toLocaleString("en-US")} ر.س`} />
          ))}
          <Row label="إجمالي المستحقات" value={`${Number(payslip.totalEarnings).toLocaleString("en-US")} ر.س`} bold />

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            الخصومات
          </Typography>
          {deductions.map((i) => (
            <Row key={i.key} label={i.nameAr} value={`${i.amount.toLocaleString("en-US")} ر.س`} />
          ))}
          <Row label="إجمالي الخصومات" value={`${Number(payslip.totalDeductions).toLocaleString("en-US")} ر.س`} bold />

          <Divider sx={{ my: 2 }} />
          <Row label="صافي الراتب" value={`${Number(payslip.netSalary).toLocaleString("en-US")} ر.س`} bold large />
        </CardContent>
      </Card>
    </Box>
  );
}

function Row({ label, value, bold, large }: { label: string; value: string; bold?: boolean; large?: boolean }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
      <Typography variant={large ? "subtitle1" : "body2"} fontWeight={bold ? 800 : 400}>
        {label}
      </Typography>
      <Typography variant={large ? "subtitle1" : "body2"} fontWeight={bold ? 800 : 400}>
        {value}
      </Typography>
    </Box>
  );
}
