"use client";
import Box from "@mui/material/Box";
import type { GridColDef } from "@mui/x-data-grid";
import DataGridRtl from "@/components/DataGridRtl";
import PageHeader from "@/components/PageHeader";
import { EMPLOYEE_STATUS_AR } from "@/lib/format";

type Row = { id: string; fullName: string; phone: string; status: string; department: { name: string }; jobTitle: { name: string } };

export default function TeamTable({ rows }: { rows: Row[] }) {
  const columns: GridColDef<Row>[] = [
    { field: "fullName", headerName: "الاسم", flex: 1 },
    { field: "departmentName", headerName: "القسم", flex: 0.8, valueGetter: (_v, row) => row.department.name },
    { field: "jobTitleName", headerName: "المسمى الوظيفي", flex: 0.8, valueGetter: (_v, row) => row.jobTitle.name },
    { field: "phone", headerName: "الجوال", width: 130 },
    { field: "status", headerName: "الحالة", width: 120, valueGetter: (v) => EMPLOYEE_STATUS_AR[v as string] },
  ];

  return (
    <Box>
      <PageHeader title="أعضاء الفريق" subtitle={`${rows.length} موظف`} />
      <DataGridRtl rows={rows} columns={columns} />
    </Box>
  );
}
