"use client";
import { useMemo } from "react";
import Box from "@mui/material/Box";
import type { GridColDef } from "@mui/x-data-grid";
import DataGridRtl from "@/components/DataGridRtl";
import type { PayslipLineItem } from "@/lib/payroll";

type Numeric = string | number | { toString(): string };
type Row = {
  id: string;
  basicSalary: Numeric;
  totalEarnings: Numeric;
  totalDeductions: Numeric;
  netSalary: Numeric;
  absentDays: Numeric;
  lineItems: string; // JSON: PayslipLineItem[]
  employee: { fullName: string; employeeNo: number };
};

const money = (v: unknown) => Number(v).toLocaleString("en-US");

/** Every distinct earning/deduction line (بدل سكن، مكافأة سنوية، تأمينات...) gets its own
 * column, built dynamically from whatever components actually appear across this run's
 * payslips — so a new bonus/deduction type shows up automatically without code changes. */
export default function PayslipsTable({ rows }: { rows: Row[] }) {
  const parsed = useMemo(
    () => rows.map((r) => ({ ...r, items: JSON.parse(r.lineItems) as PayslipLineItem[] })),
    [rows],
  );

  const extraKeys = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of parsed) {
      for (const item of r.items) {
        if (item.key === "basic") continue;
        if (!seen.has(item.key)) seen.set(item.key, item.nameAr);
      }
    }
    return [...seen.entries()];
  }, [parsed]);

  const columns: GridColDef<(typeof parsed)[number]>[] = [
    { field: "employeeNo", headerName: "الرقم", width: 80, valueGetter: (_v, row) => row.employee.employeeNo },
    { field: "employeeName", headerName: "الموظف", flex: 1, minWidth: 140, valueGetter: (_v, row) => row.employee.fullName },
    { field: "basicSalary", headerName: "الأساسي", width: 110, valueGetter: (v) => money(v) },
    ...extraKeys.map(
      ([key, nameAr]): GridColDef<(typeof parsed)[number]> => ({
        field: `item_${key}`,
        headerName: nameAr,
        width: 130,
        valueGetter: (_v, row) => {
          const item = row.items.find((i) => i.key === key);
          return item ? (item.type === "DEDUCTION" ? -item.amount : item.amount) : 0;
        },
        renderCell: (p) => money(p.value),
      }),
    ),
    { field: "totalEarnings", headerName: "إجمالي المستحقات", width: 150, valueGetter: (v) => money(v) },
    { field: "totalDeductions", headerName: "إجمالي الخصومات", width: 150, valueGetter: (v) => money(v) },
    { field: "netSalary", headerName: "الصافي", width: 120, valueGetter: (v) => money(v) },
    { field: "absentDays", headerName: "أيام الغياب", width: 100 },
  ];

  return (
    <Box>
      <DataGridRtl rows={parsed} columns={columns} />
    </Box>
  );
}
