"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import type { GridColDef } from "@mui/x-data-grid";
import DataGridRtl from "@/components/DataGridRtl";
import PageHeader from "@/components/PageHeader";
import { upsertManualAttendance } from "@/server/actions/attendance";
import { ATTENDANCE_STATUS_AR, fmtDate, fmtTime } from "@/lib/format";

type Row = { id: string; date: string | Date; checkIn: string | Date | null; checkOut: string | Date | null; status: string; source: string; employee: { fullName: string } };

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default" | "info"> = {
  PRESENT: "success",
  LATE: "warning",
  ABSENT: "error",
  ON_LEAVE: "info",
  HOLIDAY: "default",
  WEEKEND: "default",
};

export default function AttendanceClient({ rows, date, employees }: { rows: Row[]; date: string; employees: { id: string; fullName: string }[] }) {
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [entryDate, setEntryDate] = useState(date);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [status, setStatus] = useState("PRESENT");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const save = async () => {
    setError(null);
    const res = await upsertManualAttendance({ employeeId, date: entryDate, checkIn, checkOut, status });
    if (!res.ok) return setError(res.error);
    setOpen(false);
    router.refresh();
  };

  const columns: GridColDef<Row>[] = [
    { field: "employeeName", headerName: "الموظف", flex: 1, valueGetter: (_v, row) => row.employee.fullName },
    { field: "date", headerName: "التاريخ", width: 120, valueGetter: (v) => fmtDate(v as string) },
    { field: "checkIn", headerName: "الحضور", width: 100, valueGetter: (v) => (v ? fmtTime(v as string) : "—") },
    { field: "checkOut", headerName: "الانصراف", width: 100, valueGetter: (v) => (v ? fmtTime(v as string) : "—") },
    { field: "status", headerName: "الحالة", width: 120, renderCell: (p) => <Chip size="small" color={STATUS_COLOR[p.value as string]} label={ATTENDANCE_STATUS_AR[p.value as string]} /> },
    { field: "source", headerName: "المصدر", width: 100, valueGetter: (v) => (v === "WEB" ? "ذاتي" : "يدوي") },
  ];

  return (
    <Box>
      <PageHeader
        title="الحضور والانصراف"
        subtitle={fmtDate(date)}
        action={
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <TextField
              type="date"
              size="small"
              value={date}
              onChange={(e) => router.push(`/hr/attendance?date=${e.target.value}`)}
            />
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                setOpen(true);
                setEmployeeId("");
                setEntryDate(date);
                setCheckIn("");
                setCheckOut("");
                setStatus("PRESENT");
              }}
            >
              إدخال يدوي
            </Button>
          </Box>
        }
      />
      <DataGridRtl rows={rows} columns={columns} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>إدخال حضور يدوي</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField select label="الموظف" fullWidth value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              {employees.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.fullName}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="التاريخ" type="date" fullWidth InputLabelProps={{ shrink: true }} value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="الحضور" type="time" fullWidth InputLabelProps={{ shrink: true }} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              <TextField label="الانصراف" type="time" fullWidth InputLabelProps={{ shrink: true }} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </Box>
            <TextField select label="الحالة" fullWidth value={status} onChange={(e) => setStatus(e.target.value)}>
              {Object.entries(ATTENDANCE_STATUS_AR).map(([k, v]) => (
                <MenuItem key={k} value={k}>
                  {v}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={save} disabled={!employeeId || !entryDate}>
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
