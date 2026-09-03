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
import { createEmployee } from "@/server/actions/employees";
import type { DepartmentOption, JobTitleOption, QuickSuccessPayload } from "./types";

export default function QuickEmployeeForm({
  departments,
  jobTitles,
  onSuccess,
  onCancel,
}: {
  departments: DepartmentOption[];
  jobTitles: JobTitleOption[];
  onSuccess: (payload: QuickSuccessPayload) => void;
  onCancel: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [jobTitleId, setJobTitleId] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = fullName.trim() && nationalId.trim() && phone.trim() && departmentId && jobTitleId && baseSalary;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await createEmployee({
      fullName: fullName.trim(),
      nationalId: nationalId.trim(),
      phone: phone.trim(),
      departmentId,
      jobTitleId,
      hireDate: dayjs().format("YYYY-MM-DD"),
      baseSalary,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onSuccess({ title: "تمت إضافة الموظف بنجاح", subtitle: `تم تسجيل "${fullName.trim()}" في دليل الموظفين.` });
  };

  return (
    <Box component="form" onSubmit={submit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Stack spacing={2}>
        <TextField label="الاسم الكامل" required fullWidth value={fullName} onChange={(e) => setFullName(e.target.value)} autoFocus />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField label="رقم الهوية/الإقامة" required fullWidth value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
          <TextField label="رقم الجوال" required fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField select label="القسم" required fullWidth value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="المسمى الوظيفي" required fullWidth value={jobTitleId} onChange={(e) => setJobTitleId(e.target.value)}>
            {jobTitles.map((j) => (
              <MenuItem key={j.id} value={j.id}>
                {j.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <TextField
          label="الراتب الأساسي"
          required
          fullWidth
          type="number"
          value={baseSalary}
          onChange={(e) => setBaseSalary(e.target.value)}
        />
      </Stack>
      <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button variant="outlined" color="inherit" onClick={onCancel} disabled={loading}>
          رجوع
        </Button>
        <Button type="submit" variant="contained" disabled={loading || !valid} startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}>
          {loading ? "جاري الحفظ..." : "إضافة الموظف"}
        </Button>
      </Stack>
    </Box>
  );
}
