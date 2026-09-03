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
import { createLeaveType, updateLeaveType, deleteLeaveType } from "@/server/actions/leaveTypes";

type Row = { id: string; key: string; nameAr: string; annualDays: number | null; isPaid: boolean; requiresAttachment: boolean; enabled: boolean };
const EMPTY = { key: "", nameAr: "", annualDays: "", isPaid: true, requiresAttachment: false, enabled: true };

export default function LeaveTypesClient({ rows }: { rows: Row[] }) {
  const [editing, setEditing] = useState<Row | null | "new">(null);
  const [values, setValues] = useState(EMPTY);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const openEdit = (row: Row) => {
    setEditing(row);
    setValues({ key: row.key, nameAr: row.nameAr, annualDays: row.annualDays?.toString() ?? "", isPaid: row.isPaid, requiresAttachment: row.requiresAttachment, enabled: row.enabled });
  };

  const save = async () => {
    setError(null);
    const payload = { ...values, annualDays: values.annualDays === "" ? null : Number(values.annualDays) };
    const res = editing === "new" ? await createLeaveType(payload) : await updateLeaveType((editing as Row).id, payload);
    if (!res.ok) return setError(res.error);
    setEditing(null);
    router.refresh();
  };

  const remove = async () => {
    if (!deleting) return;
    await deleteLeaveType(deleting.id);
    setDeleting(null);
    router.refresh();
  };

  const columns: GridColDef<Row>[] = [
    { field: "nameAr", headerName: "النوع", flex: 1 },
    { field: "key", headerName: "المفتاح", width: 130 },
    { field: "annualDays", headerName: "الرصيد السنوي", width: 120, valueGetter: (v) => (v == null ? "بلا سقف" : v) },
    { field: "isPaid", headerName: "مدفوعة", width: 90, renderCell: (p) => (p.value ? <Chip size="small" color="success" label="نعم" /> : <Chip size="small" label="لا" />) },
    { field: "enabled", headerName: "مفعّل", width: 90, renderCell: (p) => (p.value ? <Chip size="small" color="success" label="نعم" /> : <Chip size="small" label="لا" />) },
    {
      field: "actions",
      headerName: "",
      width: 100,
      sortable: false,
      renderCell: (p) => (
        <>
          <IconButton size="small" onClick={() => openEdit(p.row)}>
            <EditRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setDeleting(p.row)}>
            <DeleteRoundedIcon fontSize="small" />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="أنواع الإجازات"
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setEditing("new");
              setValues(EMPTY);
            }}
          >
            إضافة نوع
          </Button>
        }
      />
      <DataGridRtl rows={rows} columns={columns} />

      <Dialog open={editing !== null} onClose={() => setEditing(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing === "new" ? "إضافة نوع إجازة" : "تعديل نوع إجازة"}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="اسم النوع" fullWidth value={values.nameAr} onChange={(e) => setValues((v) => ({ ...v, nameAr: e.target.value }))} autoFocus />
            <TextField
              label="المفتاح (بالإنجليزية)"
              fullWidth
              disabled={editing !== "new"}
              value={values.key}
              onChange={(e) => setValues((v) => ({ ...v, key: e.target.value }))}
            />
            <TextField
              label="الرصيد السنوي (اتركه فارغاً لبلا سقف)"
              fullWidth
              type="number"
              value={values.annualDays}
              onChange={(e) => setValues((v) => ({ ...v, annualDays: e.target.value }))}
            />
            <FormControlLabel control={<Switch checked={values.isPaid} onChange={(e) => setValues((v) => ({ ...v, isPaid: e.target.checked }))} />} label="إجازة مدفوعة الأجر" />
            <FormControlLabel
              control={<Switch checked={values.requiresAttachment} onChange={(e) => setValues((v) => ({ ...v, requiresAttachment: e.target.checked }))} />}
              label="يتطلب مرفقاً"
            />
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

      <ConfirmDeleteDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} title="حذف نوع الإجازة" message={`هل تريد حذف "${deleting?.nameAr}"؟`} />
    </Box>
  );
}
