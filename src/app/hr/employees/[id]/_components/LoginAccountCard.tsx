"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { createLoginForEmployee, setStaffActive, resetStaffPassword, updateStaffRole, updateStaffEmail } from "@/server/actions/staff";
import { ROLE_AR } from "@/lib/format";

type StaffUser = { id: string; username: string; role: string; isActive: boolean; email?: string | null } | null;

export default function LoginAccountCard({ employeeId, staffUser }: { employeeId: string; staffUser: StaffUser }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [newEmail, setNewEmail] = useState("");
  const [email, setEmail] = useState(staffUser?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const create = async () => {
    setLoading(true);
    setError(null);
    const res = await createLoginForEmployee({ employeeId, username, password, role, email: newEmail });
    setLoading(false);
    if (!res.ok) return setError(res.error);
    setCreateOpen(false);
    router.refresh();
  };

  const saveEmail = async () => {
    if (!staffUser) return;
    setLoading(true);
    setError(null);
    const res = await updateStaffEmail(staffUser.id, { email });
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
  };

  const reset = async () => {
    if (!staffUser) return;
    setLoading(true);
    setError(null);
    const res = await resetStaffPassword(staffUser.id, { password });
    setLoading(false);
    if (!res.ok) return setError(res.error);
    setResetOpen(false);
    setPassword("");
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
          حساب الدخول
        </Typography>
        {!staffUser ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              لا يوجد حساب دخول لهذا الموظف بعد
            </Typography>
            <Button variant="outlined" onClick={() => setCreateOpen(true)}>
              إنشاء حساب دخول
            </Button>
          </>
        ) : (
          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2">اسم المستخدم</Typography>
              <Typography fontWeight={700}>{staffUser.username}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2">الدور</Typography>
              <TextField
                select
                size="small"
                value={staffUser.role}
                onChange={async (e) => {
                  await updateStaffRole(staffUser.id, { role: e.target.value });
                  router.refresh();
                }}
                sx={{ minWidth: 160 }}
              >
                {Object.entries(ROLE_AR).map(([k, v]) => (
                  <MenuItem key={k} value={k}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2">مفعّل</Typography>
              <Switch
                checked={staffUser.isActive}
                onChange={async (e) => {
                  await setStaffActive(staffUser.id, e.target.checked);
                  router.refresh();
                }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                label="البريد (لتسجيل الدخول عبر Google)"
                size="small"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button variant="outlined" size="small" onClick={saveEmail} disabled={loading}>
                حفظ
              </Button>
            </Box>
            <Button variant="text" size="small" onClick={() => setResetOpen(true)}>
              إعادة تعيين كلمة المرور
            </Button>
          </Stack>
        )}
      </CardContent>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>إنشاء حساب دخول</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="اسم المستخدم" fullWidth value={username} onChange={(e) => setUsername(e.target.value)} />
            <TextField label="كلمة المرور" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />
            <TextField
              label="البريد (اختياري — لتسجيل الدخول عبر Google)"
              fullWidth
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <TextField select label="الدور" fullWidth value={role} onChange={(e) => setRole(e.target.value)}>
              {Object.entries(ROLE_AR).map(([k, v]) => (
                <MenuItem key={k} value={k}>
                  {v}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={create} disabled={loading || !username || !password}>
            إنشاء
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="كلمة المرور الجديدة"
            type="password"
            fullWidth
            sx={{ mt: 1 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setResetOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={reset} disabled={loading || !password}>
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
