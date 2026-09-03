"use client";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { clockIn, clockOut } from "@/server/actions/attendance";
import { getMyTodayAttendanceStatus } from "@/server/actions/quickActions";
import type { QuickSuccessPayload } from "./types";

export default function QuickCheckInOut({ onSuccess }: { onSuccess: (payload: QuickSuccessPayload) => void }) {
  const [status, setStatus] = useState<{ checkedIn: boolean; checkedOut: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyTodayAttendanceStatus().then(setStatus);
  }, []);

  const act = async (kind: "in" | "out") => {
    setLoading(true);
    setError(null);
    const res = kind === "in" ? await clockIn() : await clockOut();
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onSuccess({
      title: kind === "in" ? "تم تسجيل حضورك" : "تم تسجيل انصرافك",
      subtitle: kind === "in" ? "بداية موفقة ليوم عملك!" : "إلى اللقاء غداً.",
    });
  };

  if (!status) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: "center", py: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {!status.checkedIn
          ? "لم تسجّل حضورك بعد اليوم"
          : !status.checkedOut
            ? "أنت مسجّل حضور — سجّل انصرافك عند انتهاء دوامك"
            : "سجّلت حضورك وانصرافك اليوم بالفعل"}
      </Typography>
      {!status.checkedIn && (
        <Button
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LoginRoundedIcon />}
          onClick={() => act("in")}
          disabled={loading}
        >
          تسجيل الحضور الآن
        </Button>
      )}
      {status.checkedIn && !status.checkedOut && (
        <Button
          variant="contained"
          color="secondary"
          size="large"
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LogoutRoundedIcon />}
          onClick={() => act("out")}
          disabled={loading}
        >
          تسجيل الانصراف الآن
        </Button>
      )}
    </Box>
  );
}
