"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { uploadDocument, deleteDocument } from "@/server/actions/documents";
import { fmtDate } from "@/lib/format";

type DocType = { id: string; labelAr: string; hasExpiry: boolean };
type Doc = { id: string; fileName: string; expiryDate: string | Date | null; type: { labelAr: string } };

export default function DocumentsCard({ employeeId, documentTypes, documents }: { employeeId: string; documentTypes: DocType[]; documents: Doc[] }) {
  const [typeId, setTypeId] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const selectedType = documentTypes.find((t) => t.id === typeId);

  const upload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !typeId) return setError("اختر نوع الوثيقة والملف");
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("typeId", typeId);
    fd.set("employeeId", employeeId);
    if (expiryDate) fd.set("expiryDate", expiryDate);
    const res = await uploadDocument(fd);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    setTypeId("");
    setExpiryDate("");
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  };

  const remove = async (id: string) => {
    await deleteDocument(id);
    router.refresh();
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
          الوثائق
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
          {documents.map((d) => (
            <Box key={d.id} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, borderRadius: 2, bgcolor: "action.hover" }}>
              <Chip size="small" label={d.type.labelAr} />
              <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                {d.fileName}
              </Typography>
              {d.expiryDate && (
                <Typography variant="caption" color="text.secondary">
                  ينتهي {fmtDate(d.expiryDate)}
                </Typography>
              )}
              <IconButton size="small" component="a" href={`/api/files/${d.id}?dl=1`} target="_blank">
                <DownloadRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => remove(d.id)}>
                <DeleteRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          {documents.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              لا توجد وثائق مرفوعة
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
          <TextField select size="small" label="نوع الوثيقة" value={typeId} onChange={(e) => setTypeId(e.target.value)} sx={{ minWidth: 160 }}>
            {documentTypes.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.labelAr}
              </MenuItem>
            ))}
          </TextField>
          {selectedType?.hasExpiry && (
            <TextField
              size="small"
              type="date"
              label="تاريخ الانتهاء"
              InputLabelProps={{ shrink: true }}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          )}
          <input ref={fileRef} type="file" accept="application/pdf,image/jpeg,image/png" />
          <Button variant="outlined" size="small" onClick={upload} disabled={loading}>
            رفع
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
