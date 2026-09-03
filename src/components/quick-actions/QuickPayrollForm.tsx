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
import { generatePayrollRun } from "@/server/actions/payroll";
import { MONTHS_AR } from "@/lib/format";
import type { QuickSuccessPayload } from "./types";

export default function QuickPayrollForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (payload: QuickSuccessPayload) => void;
  onCancel: () => void;
}) {
  const now = dayjs();
  const [year, setYear] = useState(now.year());
  const [month, setMonth] = useState(now.month() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await generatePayrollRun({ periodYear: year, periodMonth: month });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onSuccess({
      title: "تم توليد مسير الرواتب",
      subtitle: `تم إنشاء قسائم رواتب لـ ${res.count ?? 0} موظف — راجعها من صفحة مسيرات الرواتب قبل الاعتماد.`,
    });
  };

  return (
    <Box component="form" onSubmit={submit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField select label="الشهر" fullWidth value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {MONTHS_AR.map((m, i) => (
            <MenuItem key={m} value={i + 1}>
              {m}
            </MenuItem>
          ))}
        </TextField>
        <TextField select label="السنة" fullWidth value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[now.year() - 1, now.year(), now.year() + 1].map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Alert severity="info" sx={{ mt: 2 }}>
        سيتم توليد قسائم رواتب لكل الموظفين النشطين بناءً على الراتب الأساسي وعناصر الراتب والخصومات المستحقة.
      </Alert>
      <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button variant="outlined" color="inherit" onClick={onCancel} disabled={loading}>
          رجوع
        </Button>
        <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}>
          {loading ? "جاري التوليد..." : "توليد المسير"}
        </Button>
      </Stack>
    </Box>
  );
}
