"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { clockIn, clockOut } from "@/server/actions/attendance";
import { fmtTime } from "@/lib/format";

type Record_ = { checkIn: Date | string | null; checkOut: Date | string | null } | null;

export default function CheckInOutCard({ record }: { record: Record_ }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const act = async (kind: "in" | "out") => {
    setLoading(true);
    setError(null);
    const res = kind === "in" ? await clockIn() : await clockOut();
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
          حضورك اليوم
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mb: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              الحضور
            </Typography>
            <Typography variant="h6">{record?.checkIn ? fmtTime(record.checkIn) : "—"}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              الانصراف
            </Typography>
            <Typography variant="h6">{record?.checkOut ? fmtTime(record.checkOut) : "—"}</Typography>
          </Box>
        </Box>
        {!record?.checkIn && (
          <Button variant="contained" size="large" startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LoginRoundedIcon />} onClick={() => act("in")} disabled={loading}>
            تسجيل الحضور
          </Button>
        )}
        {record?.checkIn && !record?.checkOut && (
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LogoutRoundedIcon />}
            onClick={() => act("out")}
            disabled={loading}
          >
            تسجيل الانصراف
          </Button>
        )}
        {record?.checkIn && record?.checkOut && (
          <Typography variant="body2" color="text.secondary">
            سجّلت حضورك وانصرافك اليوم بالفعل
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
