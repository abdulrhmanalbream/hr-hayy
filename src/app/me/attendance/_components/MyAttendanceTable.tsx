"use client";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import type { GridColDef } from "@mui/x-data-grid";
import DataGridRtl from "@/components/DataGridRtl";
import PageHeader from "@/components/PageHeader";
import { ATTENDANCE_STATUS_AR, fmtDate, fmtTime } from "@/lib/format";

type Row = { id: string; date: string | Date; checkIn: string | Date | null; checkOut: string | Date | null; status: string };

export default function MyAttendanceTable({ rows }: { rows: Row[] }) {
  const columns: GridColDef<Row>[] = [
    { field: "date", headerName: "التاريخ", width: 130, valueGetter: (v) => fmtDate(v as Date) },
    { field: "checkIn", headerName: "الحضور", width: 100, valueGetter: (v) => (v ? fmtTime(v as Date) : "—") },
    { field: "checkOut", headerName: "الانصراف", width: 100, valueGetter: (v) => (v ? fmtTime(v as Date) : "—") },
    { field: "status", headerName: "الحالة", width: 130, renderCell: (p) => <Chip size="small" label={ATTENDANCE_STATUS_AR[p.value as string]} /> },
  ];

  return (
    <Box>
      <PageHeader title="حضوري" />
      <DataGridRtl rows={rows} columns={columns} />
    </Box>
  );
}
