"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import type { GridColDef } from "@mui/x-data-grid";
import DataGridRtl from "@/components/DataGridRtl";
import PageHeader from "@/components/PageHeader";
import EmployeeFormDialog from "@/components/hr/EmployeeFormDialog";
import { EMPLOYEE_STATUS_AR, EMPLOYMENT_TYPE_AR } from "@/lib/format";

type Row = {
  id: string;
  employeeNo: number;
  fullName: string;
  phone: string;
  status: string;
  employmentType: string;
  department: { name: string };
  jobTitle: { name: string };
  manager: { fullName: string } | null;
  staffUser: { username: string } | null;
};

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default"> = {
  ACTIVE: "success",
  ON_LEAVE: "warning",
  SUSPENDED: "error",
  TERMINATED: "default",
};

export default function EmployeesClient({
  rows,
  departments,
  jobTitles,
}: {
  rows: Row[];
  departments: { id: string; name: string }[];
  jobTitles: { id: string; name: string }[];
}) {
  const [addOpen, setAddOpen] = useState(false);
  const router = useRouter();

  const managers = rows.map((r) => ({ id: r.id, fullName: r.fullName }));

  const columns: GridColDef<Row>[] = [
    { field: "employeeNo", headerName: "الرقم", width: 90 },
    { field: "fullName", headerName: "الاسم", flex: 1.2, minWidth: 180 },
    { field: "departmentName", headerName: "القسم", flex: 0.8, valueGetter: (_v, row) => row.department.name },
    { field: "jobTitleName", headerName: "المسمى الوظيفي", flex: 0.8, valueGetter: (_v, row) => row.jobTitle.name },
    { field: "phone", headerName: "الجوال", width: 130 },
    {
      field: "status",
      headerName: "الحالة",
      width: 130,
      renderCell: (p) => <Chip size="small" label={EMPLOYEE_STATUS_AR[p.value as string]} color={STATUS_COLOR[p.value as string]} />,
    },
    { field: "employmentType", headerName: "نوع الدوام", width: 110, valueGetter: (v) => EMPLOYMENT_TYPE_AR[v as string] },
    {
      field: "hasLogin",
      headerName: "حساب دخول",
      width: 110,
      valueGetter: (_v, row) => (row.staffUser ? "مفعّل" : "—"),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="دليل الموظفين"
        subtitle={`${rows.length} موظف`}
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setAddOpen(true)}>
            إضافة موظف
          </Button>
        }
      />
      <DataGridRtl
        rows={rows}
        columns={columns}
        onRowClick={(p) => router.push(`/hr/employees/${p.id}`)}
        sx={{ cursor: "pointer" }}
      />
      <EmployeeFormDialog open={addOpen} onClose={() => setAddOpen(false)} departments={departments} jobTitles={jobTitles} managers={managers} />
    </Box>
  );
}
