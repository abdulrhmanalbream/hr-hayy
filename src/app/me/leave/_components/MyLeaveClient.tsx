"use client";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import type { GridColDef } from "@mui/x-data-grid";
import Link from "next/link";
import DataGridRtl from "@/components/DataGridRtl";
import PageHeader from "@/components/PageHeader";
import { cancelLeaveRequest } from "@/server/actions/leaveRequests";
import { LEAVE_STATUS_AR, fmtDate } from "@/lib/format";

type Row = {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  daysCount: string | number | { toString(): string };
  reason: string;
  status: string;
  rejectionNote: string | null;
  leaveType: { nameAr: string };
};

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
  CANCELED: "default",
};

export default function MyLeaveClient({ rows }: { rows: Row[] }) {
  const router = useRouter();

  const cancel = async (id: string) => {
    await cancelLeaveRequest(id);
    router.refresh();
  };

  const columns: GridColDef<Row>[] = [
    { field: "leaveTypeName", headerName: "النوع", flex: 0.8, valueGetter: (_v, row) => row.leaveType.nameAr },
    { field: "startDate", headerName: "من", width: 110, valueGetter: (v) => fmtDate(v as string) },
    { field: "endDate", headerName: "إلى", width: 110, valueGetter: (v) => fmtDate(v as string) },
    { field: "daysCount", headerName: "المدة", width: 80 },
    { field: "status", headerName: "الحالة", width: 130, renderCell: (p) => <Chip size="small" color={STATUS_COLOR[p.value as string]} label={LEAVE_STATUS_AR[p.value as string]} /> },
    { field: "rejectionNote", headerName: "ملاحظة", flex: 1, valueGetter: (v) => v || "—" },
    {
      field: "actions",
      headerName: "",
      width: 80,
      sortable: false,
      renderCell: (p) =>
        p.row.status === "PENDING" ? (
          <Tooltip title="إلغاء الطلب">
            <IconButton size="small" onClick={() => cancel(p.row.id)}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <Box>
      <PageHeader
        title="إجازاتي"
        action={
          <Button component={Link} href="/me/leave/new" variant="contained" startIcon={<AddRoundedIcon />}>
            طلب إجازة جديد
          </Button>
        }
      />
      <DataGridRtl rows={rows} columns={columns} />
    </Box>
  );
}
