"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { assignEmployeeSalaryComponent, removeEmployeeSalaryComponent } from "@/server/actions/salaryComponents";
import Money from "@/components/Money";

type Component = { id: string; nameAr: string; type: "EARNING" | "DEDUCTION" };
type Assignment = { id: string; amount: string | number | { toString(): string }; component: Component };

export default function SalaryComponentsCard({
  employeeId,
  allComponents,
  assignments,
  baseSalary,
}: {
  employeeId: string;
  allComponents: Component[];
  assignments: Assignment[];
  baseSalary: string | number | { toString(): string };
}) {
  const [componentId, setComponentId] = useState("");
  const [amount, setAmount] = useState("");
  const router = useRouter();

  const add = async () => {
    if (!componentId || !amount) return;
    await assignEmployeeSalaryComponent({ employeeId, componentId, amount });
    setComponentId("");
    setAmount("");
    router.refresh();
  };

  const remove = async (id: string) => {
    await removeEmployeeSalaryComponent(id);
    router.refresh();
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
          عناصر الراتب
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", p: 1, mb: 1, borderRadius: 2, bgcolor: "action.hover" }}>
          <Typography variant="body2" fontWeight={700}>
            أساسي (نظامي)
          </Typography>
          <Money value={String(baseSalary)} />
        </Box>
        {assignments.map((a) => (
          <Box key={a.id} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, borderRadius: 2 }}>
            <Chip size="small" label={a.component.type === "EARNING" ? "مستحق" : "خصم"} color={a.component.type === "EARNING" ? "success" : "error"} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {a.component.nameAr}
            </Typography>
            <Money value={String(a.amount)} />
            <IconButton size="small" onClick={() => remove(a.id)}>
              <DeleteRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mt: 2 }}>
          <TextField select size="small" label="عنصر" value={componentId} onChange={(e) => setComponentId(e.target.value)} sx={{ minWidth: 160 }}>
            {allComponents
              .filter((c) => !assignments.some((a) => a.component === c || a.component.nameAr === c.nameAr))
              .map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nameAr}
                </MenuItem>
              ))}
          </TextField>
          <TextField size="small" type="number" label="المبلغ" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ width: 120 }} />
          <Button variant="outlined" size="small" onClick={add}>
            إضافة
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
