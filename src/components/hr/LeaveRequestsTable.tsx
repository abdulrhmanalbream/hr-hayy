"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import type { GridColDef } from "@mui/x-data-grid";
import DataGridRtl from "@/components/DataGridRtl";
import { approveLeaveRequest, rejectLeaveRequest } from "@/server/actions/leaveRequests";
import { LEAVE_STATUS_AR, fmtDate } from "@/lib/format";

export type LeaveRequestRow = {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  daysCount: string | number | { toString(): string };
  reason: string;
  status: string;
  createdAt: string | Date;
  employee: { fullName: string };
  leaveType: { nameAr: string };
};

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
  CANCELED: "default",
};

export default function LeaveRequestsTable({ rows, canReview = true }: { rows: LeaveRequestRow[]; canReview?: boolean }) {
  const [rejecting, setRejecting] = useState<LeaveRequestRow | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const approve = async (id: string) => {
    const res = await approveLeaveRequest(id);
    if (!res.ok) setError(res.error);
    router.refresh();
  };

  const reject = async () => {
    if (!rejecting) return;
    const res = await rejectLeaveRequest(rejecting.id, { rejectionNote: note });
    if (!res.ok) return setError(res.error);
    setRejecting(null);
    setNote("");
    router.refresh();
  };

  const columns: GridColDef<LeaveRequestRow>[] = [
    { field: "employeeName", headerName: "الموظف", flex: 1, valueGetter: (_v, row) => row.employee.fullName },
    { field: "leaveTypeName", headerName: "نوع الإجازة", flex: 0.8, valueGetter: (_v, row) => row.leaveType.nameAr },
    { field: "startDate", headerName: "من", width: 110, valueGetter: (v) => fmtDate(v as string) },
    { field: "endDate", headerName: "إلى", width: 110, valueGetter: (v) => fmtDate(v as string) },
    { field: "daysCount", headerName: "المدة", width: 80 },
    { field: "reason", headerName: "السبب", flex: 1 },
    { field: "status", headerName: "الحالة", width: 130, renderCell: (p) => <Chip size="small" color={STATUS_COLOR[p.value as string]} label={LEAVE_STATUS_AR[p.value as string]} /> },
    ...(canReview
      ? [
          {
            field: "actions",
            headerName: "",
            width: 100,
            sortable: false,
            renderCell: (p: { row: LeaveRequestRow }) =>
              p.row.status === "PENDING" ? (
                <>
                  <Tooltip title="اعتماد">
                    <IconButton size="small" color="success" onClick={() => approve(p.row.id)}>
                      <CheckRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="رفض">
                    <IconButton size="small" color="error" onClick={() => setRejecting(p.row)}>
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              ) : null,
          } satisfies GridColDef<LeaveRequestRow>,
        ]
      : []),
  ];

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <DataGridRtl rows={rows} columns={columns} />

      <Dialog open={!!rejecting} onClose={() => setRejecting(null)} maxWidth="xs" fullWidth>
        <DialogTitle>رفض طلب الإجازة</DialogTitle>
        <DialogContent>
          <TextField label="سبب الرفض" fullWidth multiline rows={2} sx={{ mt: 1 }} value={note} onChange={(e) => setNote(e.target.value)} autoFocus />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejecting(null)}>إلغاء</Button>
          <Button variant="contained" color="error" onClick={reject} disabled={!note.trim()}>
            رفض الطلب
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
