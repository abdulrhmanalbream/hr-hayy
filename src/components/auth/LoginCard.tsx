"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Logo from "@/components/Logo";
import { roleHome } from "@/lib/auth/session";

export default function LoginCard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "تعذر تسجيل الدخول");
        return;
      }
      const next = searchParams.get("next");
      const isSafeNext = !!next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\");
      const target = isSafeNext ? next : roleHome(data.areas ?? []);
      router.replace(target);
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
        background: (t) =>
          t.palette.mode === "dark"
            ? "linear-gradient(160deg, #171310 0%, #221C16 60%, #2B231B 100%)"
            : "linear-gradient(160deg, #F8F4EC 0%, #F1E8D6 55%, #EADFC9 100%)",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
            <Logo height={44} />
          </Box>
          <Typography variant="h5" align="center" color="secondary.main">
            شؤون الموظفين
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
            دخول موظفي شركة تطوير الحي
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={submit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="اسم المستخدم أو البريد الإلكتروني"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="كلمة المرور"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
