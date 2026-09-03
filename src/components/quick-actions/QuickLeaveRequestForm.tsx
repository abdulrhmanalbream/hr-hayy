"use client";
import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import dayjs from "dayjs";
import { submitLeaveRequest } from "@/server/actions/leaveRequests";
import type { LeaveTypeOption, QuickSuccessPayload } from "./types";

export default function QuickLeaveRequestForm({
  leaveTypes,
  onSuccess,
  onCancel,
}: {
  leaveTypes: LeaveTypeOption[];
  onSuccess: (payload: QuickSuccessPayload) => void;
  onCancel: () => void;
}) {
  const today = dayjs().format("YYYY-MM-DD");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = leaveTypeId && startDate && endDate && reason.trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await submitLeaveRequest({ leaveTypeId, kind: "FULL_DAY", startDate, endDate, reason: reason.trim() });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onSuccess({ title: "تم إرسال طلب الإجازة", subtitle: "سيصلك إشعار عند البت في الطلب من مديرك المباشر." });
  };

  return (
    <Box component="form" onSubmit={submit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Stack spacing={2}>
        <TextField select label="نوع الإجازة" required fullWidth value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)} autoFocus>
          {leaveTypes.map((lt) => (
            <MenuItem key={lt.id} value={lt.id}>
              {lt.nameAr}
              {lt.annualDays != null ? ` (رصيد سنوي ${lt.annualDays} يوم)` : ""}
            </MenuItem>
          ))}
        </TextField>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="من تاريخ"
            required
            fullWidth
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <TextField
            label="إلى تاريخ"
            required
            fullWidth
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Stack>
        <TextField label="السبب" required fullWidth multiline rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
      </Stack>
      <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button variant="outlined" color="inherit" onClick={onCancel} disabled={loading}>
          رجوع
        </Button>
        <Button type="submit" variant="contained" disabled={loading || !valid} startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}>
          {loading ? "جاري الإرسال..." : "إرسال الطلب"}
        </Button>
      </Stack>
    </Box>
  );
}
