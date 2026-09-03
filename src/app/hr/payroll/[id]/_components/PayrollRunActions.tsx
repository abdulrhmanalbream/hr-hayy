"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { approvePayrollRun, markPayrollRunPaid } from "@/server/actions/payroll";

export default function PayrollRunActions({ id, status }: { id: string; status: string }) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const approve = async () => {
    const res = await approvePayrollRun(id);
    if (!res.ok) return setError(res.error);
    router.refresh();
  };
  const markPaid = async () => {
    const res = await markPayrollRunPaid(id);
    if (!res.ok) return setError(res.error);
    router.refresh();
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: "flex", gap: 1.5 }}>
        {status === "DRAFT" && (
          <Button variant="contained" onClick={approve}>
            اعتماد المسير
          </Button>
        )}
        {status === "APPROVED" && (
          <Button variant="contained" color="success" onClick={markPaid}>
            تعليم كمدفوع
          </Button>
        )}
      </Box>
    </Box>
  );
}
