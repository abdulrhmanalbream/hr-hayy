"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import type { GridColDef } from "@mui/x-data-grid";
import DataGridRtl from "@/components/DataGridRtl";
import PageHeader from "@/components/PageHeader";
import QuickPayrollForm from "@/components/quick-actions/QuickPayrollForm";
import { monthLabel, PAYROLL_STATUS_AR } from "@/lib/format";

type Numeric = string | number | { toString(): string };
type Row = { id: string; periodYear: number; periodMonth: number; status: string; totalGross: Numeric; totalDeductions: Numeric; totalNet: Numeric };

const STATUS_COLOR: Record<string, "default" | "info" | "success"> = { DRAFT: "default", APPROVED: "info", PAID: "success" };

export default function PayrollRunsClient({ rows }: { rows: Row[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const columns: GridColDef<Row>[] = [
    { field: "period", headerName: "الشهر", flex: 1, valueGetter: (_v, row) => monthLabel(row.periodYear, row.periodMonth) },
    { field: "totalGross", headerName: "إجمالي المستحقات", width: 150, valueGetter: (v) => Number(v).toLocaleString("en-US") },
    { field: "totalDeductions", headerName: "إجمالي الخصومات", width: 150, valueGetter: (v) => Number(v).toLocaleString("en-US") },
    { field: "totalNet", headerName: "الصافي", width: 150, valueGetter: (v) => Number(v).toLocaleString("en-US") },
    { field: "status", headerName: "الحالة", width: 120, renderCell: (p) => <Chip size="small" color={STATUS_COLOR[p.value as string]} label={PAYROLL_STATUS_AR[p.value as string]} /> },
  ];

  return (
    <Box>
      <PageHeader
        title="مسيرات الرواتب"
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpen(true)}>
            تشغيل مسير جديد
          </Button>
        }
      />
      <DataGridRtl rows={rows} columns={columns} onRowClick={(p) => router.push(`/hr/payroll/${p.id}`)} sx={{ cursor: "pointer" }} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>تشغيل مسير رواتب</DialogTitle>
        <DialogContent>
          <QuickPayrollForm
            onSuccess={() => {
              setOpen(false);
              router.refresh();
            }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
