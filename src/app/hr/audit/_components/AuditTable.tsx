"use client";
import Box from "@mui/material/Box";
import type { GridColDef } from "@mui/x-data-grid";
import PageHeader from "@/components/PageHeader";
import DataGridRtl from "@/components/DataGridRtl";
import { fmtDateTime } from "@/lib/format";

const ACTION_AR: Record<string, string> = { CREATE: "إضافة", UPDATE: "تعديل", DELETE: "حذف" };

type Row = { id: string; createdAt: string | Date; changedBy: string; action: string; entityName: string; entityId: string };

export default function AuditTable({ rows }: { rows: Row[] }) {
  const columns: GridColDef<Row>[] = [
    { field: "createdAt", headerName: "الوقت", width: 160, valueGetter: (v) => fmtDateTime(v as Date) },
    { field: "changedBy", headerName: "بواسطة", width: 150 },
    { field: "action", headerName: "الإجراء", width: 100, valueGetter: (v) => ACTION_AR[v as string] ?? v },
    { field: "entityName", headerName: "العنصر", width: 160 },
    { field: "entityId", headerName: "المعرّف", flex: 1 },
  ];

  return (
    <Box>
      <PageHeader title="سجل التغييرات" />
      <DataGridRtl rows={rows} columns={columns} />
    </Box>
  );
}
