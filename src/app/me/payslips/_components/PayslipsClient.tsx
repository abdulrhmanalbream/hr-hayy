"use client";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import type { GridColDef } from "@mui/x-data-grid";
import DataGridRtl from "@/components/DataGridRtl";
import PageHeader from "@/components/PageHeader";
import { monthLabel } from "@/lib/format";

type Row = {
  id: string;
  netSalary: string | number | { toString(): string };
  totalEarnings: string | number | { toString(): string };
  totalDeductions: string | number | { toString(): string };
  payrollRun: { periodYear: number; periodMonth: number; status: string };
};

export default function PayslipsClient({ rows }: { rows: Row[] }) {
  const router = useRouter();

  const columns: GridColDef<Row>[] = [
    { field: "period", headerName: "الشهر", flex: 1, valueGetter: (_v, row) => monthLabel(row.payrollRun.periodYear, row.payrollRun.periodMonth) },
    { field: "totalEarnings", headerName: "المستحقات", width: 130, valueGetter: (v) => Number(v).toLocaleString("en-US") },
    { field: "totalDeductions", headerName: "الخصومات", width: 130, valueGetter: (v) => Number(v).toLocaleString("en-US") },
    { field: "netSalary", headerName: "الصافي", width: 130, valueGetter: (v) => Number(v).toLocaleString("en-US") },
  ];

  return (
    <Box>
      <PageHeader title="قسائم الراتب" />
      <DataGridRtl rows={rows} columns={columns} onRowClick={(p) => router.push(`/me/payslips/${p.id}`)} sx={{ cursor: "pointer" }} />
    </Box>
  );
}
