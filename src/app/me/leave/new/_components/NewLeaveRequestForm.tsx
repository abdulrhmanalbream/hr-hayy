"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import PageHeader from "@/components/PageHeader";
import { submitLeaveRequest } from "@/server/actions/leaveRequests";
import dayjs from "dayjs";

type LeaveTypeOption = { id: string; nameAr: string; annualDays: number | null };

export default function NewLeaveRequestForm({ leaveTypes }: { leaveTypes: LeaveTypeOption[] }) {
  const today = dayjs().format("YYYY-MM-DD");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [kind, setKind] = useState<"FULL_DAY" | "HOURLY">("FULL_DAY");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const valid = leaveTypeId && startDate && endDate && reason.trim() && (kind === "FULL_DAY" || (startTime && endTime));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await submitLeaveRequest({
      leaveTypeId,
      kind,
      startDate,
      endDate: kind === "HOURLY" ? startDate : endDate,
      startTime: kind === "HOURLY" ? startTime : undefined,
      endTime: kind === "HOURLY" ? endTime : undefined,
      reason: reason.trim(),
    });
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.push("/me/leave");
    router.refresh();
  };

  return (
    <Box>
      <PageHeader title="طلب إجازة جديد" />
      <Card sx={{ maxWidth: 560 }}>
        <CardContent>
          <Box component="form" onSubmit={submit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Stack spacing={2}>
              <ToggleButtonGroup exclusive value={kind} onChange={(_e, v) => v && setKind(v)}>
                <ToggleButton value="FULL_DAY">إجازة بالأيام</ToggleButton>
                <ToggleButton value="HOURLY">مغادرة بالساعات</ToggleButton>
              </ToggleButtonGroup>

              <TextField select label="نوع الإجازة" required fullWidth value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)}>
                {leaveTypes.map((lt) => (
                  <MenuItem key={lt.id} value={lt.id}>
                    {lt.nameAr}
                    {lt.annualDays != null ? ` (رصيد سنوي ${lt.annualDays} يوم)` : ""}
                  </MenuItem>
                ))}
              </TextField>

              {kind === "FULL_DAY" ? (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField label="من تاريخ" required fullWidth type="date" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <TextField label="إلى تاريخ" required fullWidth type="date" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </Stack>
              ) : (
                <>
                  <TextField label="التاريخ" required fullWidth type="date" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField label="من الساعة" required fullWidth type="time" InputLabelProps={{ shrink: true }} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    <TextField label="إلى الساعة" required fullWidth type="time" InputLabelProps={{ shrink: true }} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </Stack>
                </>
              )}

              <TextField label="السبب" required fullWidth multiline rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
            </Stack>

            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button variant="contained" type="submit" disabled={loading || !valid}>
                {loading ? "جاري الإرسال..." : "إرسال الطلب"}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
