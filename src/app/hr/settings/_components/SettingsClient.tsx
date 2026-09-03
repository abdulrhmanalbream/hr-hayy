"use client";
import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import PageHeader from "@/components/PageHeader";
import { setSetting } from "@/server/actions/settings";

export default function SettingsClient({ gosiPercent }: { gosiPercent: string }) {
  const [value, setValue] = useState(gosiPercent);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    setSaved(false);
    const res = await setSetting({ key: "gosi_percent", value });
    if (!res.ok) return setError(res.error);
    setSaved(true);
  };

  return (
    <Box>
      <PageHeader title="الإعدادات" />
      <Card sx={{ maxWidth: 480 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
            نسبة التأمينات الاجتماعية (GOSI)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            نسبة تقريبية تُستخدم في حساب خصم التأمينات عند توليد مسير الرواتب — لا يوجد ربط حقيقي بمنصة التأمينات الاجتماعية بعد.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {saved && (
            <Alert severity="success" sx={{ mb: 2 }}>
              تم الحفظ
            </Alert>
          )}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField label="النسبة %" type="number" value={value} onChange={(e) => setValue(e.target.value)} sx={{ width: 160 }} />
            <Button variant="contained" onClick={save}>
              حفظ
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
