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
import Alert from "@mui/material/Alert";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import type { GridColDef } from "@mui/x-data-grid";
import DataGridRtl from "@/components/DataGridRtl";
import PageHeader from "@/components/PageHeader";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { createJobTitle, updateJobTitle, deleteJobTitle } from "@/server/actions/jobTitles";

type Row = { id: string; name: string; employees: { id: string }[] };

export default function JobTitlesClient({ rows }: { rows: Row[] }) {
  const [editing, setEditing] = useState<Row | null | "new">(null);
  const [name, setName] = useState("");
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const save = async () => {
    setError(null);
    const res = editing === "new" ? await createJobTitle({ name }) : await updateJobTitle((editing as Row).id, { name });
    if (!res.ok) return setError(res.error);
    setEditing(null);
    router.refresh();
  };

  const remove = async () => {
    if (!deleting) return;
    await deleteJobTitle(deleting.id);
    setDeleting(null);
    router.refresh();
  };

  const columns: GridColDef<Row>[] = [
    { field: "name", headerName: "المسمى الوظيفي", flex: 1 },
    { field: "employeeCount", headerName: "عدد الموظفين", width: 130, valueGetter: (_v, row) => row.employees.length },
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
              setName(p.row.name);
            }}
          >
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
        title="المسميات الوظيفية"
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setEditing("new");
              setName("");
            }}
          >
            إضافة مسمى
          </Button>
        }
      />
      <DataGridRtl rows={rows} columns={columns} />

      <Dialog open={editing !== null} onClose={() => setEditing(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing === "new" ? "إضافة مسمى وظيفي" : "تعديل مسمى وظيفي"}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField label="الاسم" fullWidth sx={{ mt: 1 }} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
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
        title="حذف المسمى الوظيفي"
        message={`هل تريد حذف "${deleting?.name}"؟`}
      />
    </Box>
  );
}
