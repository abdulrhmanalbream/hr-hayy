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
import Alert from "@mui/material/Alert";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import type { GridColDef } from "@mui/x-data-grid";
import DataGridRtl from "@/components/DataGridRtl";
import PageHeader from "@/components/PageHeader";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { createDepartment, updateDepartment, deleteDepartment } from "@/server/actions/departments";

type Row = { id: string; name: string; headEmployee: { fullName: string } | null; employees: { id: string }[] };

export default function DepartmentsClient({ rows, employees }: { rows: Row[]; employees: { id: string; fullName: string }[] }) {
  const [editing, setEditing] = useState<Row | null | "new">(null);
  const [name, setName] = useState("");
  const [headEmployeeId, setHeadEmployeeId] = useState("");
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const openNew = () => {
    setEditing("new");
    setName("");
    setHeadEmployeeId("");
  };
  const openEdit = (row: Row) => {
    setEditing(row);
    setName(row.name);
    setHeadEmployeeId(employees.find((e) => e.fullName === row.headEmployee?.fullName)?.id ?? "");
  };

  const save = async () => {
    setError(null);
    const res = editing === "new" ? await createDepartment({ name, headEmployeeId }) : await updateDepartment((editing as Row).id, { name, headEmployeeId });
    if (!res.ok) return setError(res.error);
    setEditing(null);
    router.refresh();
  };

  const remove = async () => {
    if (!deleting) return;
    await deleteDepartment(deleting.id);
    setDeleting(null);
    router.refresh();
  };

  const columns: GridColDef<Row>[] = [
    { field: "name", headerName: "القسم", flex: 1 },
    { field: "headEmployeeName", headerName: "رئيس القسم", flex: 1, valueGetter: (_v, row) => row.headEmployee?.fullName ?? "—" },
    { field: "employeeCount", headerName: "عدد الموظفين", width: 130, valueGetter: (_v, row) => row.employees.length },
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
        title="الأقسام"
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openNew}>
            إضافة قسم
          </Button>
        }
      />
      <DataGridRtl rows={rows} columns={columns} />

      <Dialog open={editing !== null} onClose={() => setEditing(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing === "new" ? "إضافة قسم" : "تعديل قسم"}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="اسم القسم" fullWidth value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <TextField select label="رئيس القسم (اختياري)" fullWidth value={headEmployeeId} onChange={(e) => setHeadEmployeeId(e.target.value)}>
              <MenuItem value="">بدون</MenuItem>
              {employees.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.fullName}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditing(null)}>إلغاء</Button>
          <Button variant="contained" onClick={save} disabled={!name.trim()}>
            حفظ
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title="حذف القسم"
        message={`هل تريد حذف قسم "${deleting?.name}"؟`}
      />
    </Box>
  );
}
