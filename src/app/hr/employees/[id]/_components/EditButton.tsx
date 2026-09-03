"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EmployeeFormDialog, { type EmployeeFormValues } from "@/components/hr/EmployeeFormDialog";

export default function EditButton({
  employeeId,
  departments,
  jobTitles,
  managers,
  initial,
}: {
  employeeId: string;
  departments: { id: string; name: string }[];
  jobTitles: { id: string; name: string }[];
  managers: { id: string; fullName: string }[];
  initial: Partial<EmployeeFormValues>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => setOpen(true)}>
        تعديل
      </Button>
      <EmployeeFormDialog
        open={open}
        onClose={() => setOpen(false)}
        departments={departments}
        jobTitles={jobTitles}
        managers={managers}
        employeeId={employeeId}
        initial={initial}
      />
    </>
  );
}
