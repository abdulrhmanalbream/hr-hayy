"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import type { GridColDef } from "@mui/x-data-grid";
import DataGridRtl from "@/components/DataGridRtl";
import PageHeader from "@/components/PageHeader";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { createSalaryComponent, updateSalaryComponent, deleteSalaryComponent } from "@/server/actions/salaryComponents";

type Row = { id: string; key: string; nameAr: string; type: "EARNING" | "DEDUCTION"; isRecurring: boolean; isSystem: boolean; enabled: boolean };
type FormValues = { key: string; nameAr: string; type: "EARNING" | "DEDUCTION"; isRecurring: boolean; enabled: boolean };
const EMPTY: FormValues = { key: "", nameAr: "", type: "EARNING", isRecurring: true, enabled: true };

export default function SalaryComponentsClient({ rows }: { rows: Row[] }) {
  const [editing, setEditing] = useState<Row | null | "new">(null);
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const save = async () => {
    setError(null);
    const res = editing === "new" ? await createSalaryComponent(values) : await updateSalaryComponent((editing as Row).id, values);
    if (!res.ok) return setError(res.error);
    setEditing(null);
    router.refresh();
  };

  const remove = async () => {
    if (!deleting) return;
    const res = await deleteSalaryComponent(deleting.id);
    if (!res.ok) setError(res.error);
    setDeleting(null);
    router.refresh();
  };

  const columns: GridColDef<Row>[] = [
    { field: "nameAr", headerName: "العنصر", flex: 1 },
    { field: "key", headerName: "المفتاح", width: 130 },
    { field: "type", headerName: "النوع", width: 100, renderCell: (p) => <Chip size="small" color={p.value === "EARNING" ? "success" : "error"} label={p.value === "EARNING" ? "مستحق" : "خصم"} /> },
    { field: "isSystem", headerName: "نظامي", width: 90, renderCell: (p) => (p.value ? <Chip size="small" label="نعم" /> : "—") },
    {
      field: "actions",
      headerName: "",
      width: 100,
      sortable: false,
      renderCell: (p) => (
        <>
          <IconButton
            size="small"
            onClick={() => {
              setEditing(p.row);
              setValues(p.row);
            }}
          >
            <EditRoundedIcon fontSize="small" />
          </IconButton>
          {!p.row.isSystem && (
            <IconButton size="small" onClick={() => setDeleting(p.row)}>
              <DeleteRoundedIcon fontSize="small" />
            </IconButton>
          )}
        </>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="عناصر الراتب"
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setEditing("new");
              setValues(EMPTY);
            }}
          >
            إضافة عنصر
          </Button>
        }
      />
      <DataGridRtl rows={rows} columns={columns} />

      <Dialog open={editing !== null} onClose={() => setEditing(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing === "new" ? "إضافة عنصر راتب" : "تعديل عنصر راتب"}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="اسم العنصر" fullWidth value={values.nameAr} onChange={(e) => setValues((v) => ({ ...v, nameAr: e.target.value }))} autoFocus />
            <TextField
              label="المفتاح (بالإنجليزية)"
              fullWidth
              disabled={editing !== "new"}
              value={values.key}
              onChange={(e) => setValues((v) => ({ ...v, key: e.target.value }))}
            />
            <TextField
              select
              label="النوع"
              fullWidth
              disabled={editing !== "new" && (editing as Row)?.isSystem}
              value={values.type}
              onChange={(e) => setValues((v) => ({ ...v, type: e.target.value as "EARNING" | "DEDUCTION" }))}
            >
              <MenuItem value="EARNING">مستحق</MenuItem>
              <MenuItem value="DEDUCTION">خصم</MenuItem>
            </TextField>
            <FormControlLabel control={<Switch checked={values.enabled} onChange={(e) => setValues((v) => ({ ...v, enabled: e.target.checked }))} />} label="مفعّل" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditing(null)}>إلغاء</Button>
          <Button variant="contained" onClick={save} disabled={!values.nameAr.trim() || !values.key.trim()}>
            حفظ
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} title="حذف عنصر الراتب" message={`هل تريد حذف "${deleting?.nameAr}"؟`} />
    </Box>
  );
}
