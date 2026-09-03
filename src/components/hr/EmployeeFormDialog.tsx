"use client";
import { useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import Alert from "@mui/material/Alert";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { useRouter } from "next/navigation";
import { createEmployee, updateEmployee } from "@/server/actions/employees";

type Option = { id: string; name?: string; fullName?: string };

export type EmployeeFormValues = {
  fullName: string;
  nationalId: string;
  nationality: string;
  gender: string;
  birthDate: string;
  phone: string;
  email: string;
  departmentId: string;
  jobTitleId: string;
  managerId: string;
  hireDate: string;
  employmentType: string;
  status: string;
  iqamaExpiry: string;
  contractExpiry: string;
  bankName: string;
  bankIban: string;
  baseSalary: string;
  gosiExempt: boolean;
};

const EMPTY: EmployeeFormValues = {
  fullName: "",
  nationalId: "",
  nationality: "",
  gender: "",
  birthDate: "",
  phone: "",
  email: "",
  departmentId: "",
  jobTitleId: "",
  managerId: "",
  hireDate: "",
  employmentType: "FULL_TIME",
  status: "ACTIVE",
  iqamaExpiry: "",
  contractExpiry: "",
  bankName: "",
  bankIban: "",
  baseSalary: "",
  gosiExempt: false,
};

export default function EmployeeFormDialog({
  open,
  onClose,
  departments,
  jobTitles,
  managers,
  employeeId,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  departments: Option[];
  jobTitles: Option[];
  managers: Option[];
  employeeId?: string;
  initial?: Partial<EmployeeFormValues>;
}) {
  const [values, setValues] = useState<EmployeeFormValues>({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const set = (k: keyof EmployeeFormValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = employeeId ? await updateEmployee(employeeId, values) : await createEmployee(values);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setValues(EMPTY);
    onClose();
    router.refresh();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{employeeId ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}</DialogTitle>
      <Box component="form" onSubmit={submit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField label="الاسم الكامل" required fullWidth value={values.fullName} onChange={set("fullName")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="رقم الهوية/الإقامة" required fullWidth value={values.nationalId} onChange={set("nationalId")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="رقم الجوال" required fullWidth value={values.phone} onChange={set("phone")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="البريد الإلكتروني" fullWidth value={values.email} onChange={set("email")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="الجنسية" fullWidth value={values.nationality} onChange={set("nationality")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="الجنس" fullWidth value={values.gender} onChange={set("gender")}>
                <MenuItem value="">—</MenuItem>
                <MenuItem value="MALE">ذكر</MenuItem>
                <MenuItem value="FEMALE">أنثى</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="تاريخ الميلاد" type="date" fullWidth InputLabelProps={{ shrink: true }} value={values.birthDate} onChange={set("birthDate")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="القسم" required fullWidth value={values.departmentId} onChange={set("departmentId")}>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="المسمى الوظيفي" required fullWidth value={values.jobTitleId} onChange={set("jobTitleId")}>
                {jobTitles.map((j) => (
                  <MenuItem key={j.id} value={j.id}>
                    {j.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="المدير المباشر" fullWidth value={values.managerId} onChange={set("managerId")}>
                <MenuItem value="">بدون</MenuItem>
                {managers
                  .filter((m) => m.id !== employeeId)
                  .map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.fullName}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="تاريخ التعيين" type="date" required fullWidth InputLabelProps={{ shrink: true }} value={values.hireDate} onChange={set("hireDate")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="نوع الدوام" fullWidth value={values.employmentType} onChange={set("employmentType")}>
                <MenuItem value="FULL_TIME">دوام كامل</MenuItem>
                <MenuItem value="PART_TIME">دوام جزئي</MenuItem>
                <MenuItem value="CONTRACTOR">متعاقد</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="الحالة" fullWidth value={values.status} onChange={set("status")}>
                <MenuItem value="ACTIVE">نشط</MenuItem>
                <MenuItem value="ON_LEAVE">في إجازة</MenuItem>
                <MenuItem value="SUSPENDED">موقوف</MenuItem>
                <MenuItem value="TERMINATED">منتهي الخدمة</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="الراتب الأساسي" type="number" required fullWidth value={values.baseSalary} onChange={set("baseSalary")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="انتهاء الإقامة" type="date" fullWidth InputLabelProps={{ shrink: true }} value={values.iqamaExpiry} onChange={set("iqamaExpiry")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="انتهاء العقد" type="date" fullWidth InputLabelProps={{ shrink: true }} value={values.contractExpiry} onChange={set("contractExpiry")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="اسم البنك" fullWidth value={values.bankName} onChange={set("bankName")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="رقم الآيبان" fullWidth value={values.bankIban} onChange={set("bankIban")} />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={values.gosiExempt}
                    onChange={(e) => setValues((v) => ({ ...v, gosiExempt: e.target.checked }))}
                  />
                }
                label="معفى من خصم التأمينات الاجتماعية (GOSI) عند توليد الرواتب"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
