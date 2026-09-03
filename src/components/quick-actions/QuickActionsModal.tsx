"use client";
import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import { getQuickActionsBootstrapData } from "@/server/actions/quickActions";
import QuickEmployeeForm from "./QuickEmployeeForm";
import QuickPayrollForm from "./QuickPayrollForm";
import QuickLeaveRequestForm from "./QuickLeaveRequestForm";
import QuickCheckInOut from "./QuickCheckInOut";
import QuickSuccessScreen from "./QuickSuccessScreen";
import type { QuickActionArea, QuickActionView, QuickSuccessPayload } from "./types";

type CardDef = { id: QuickActionView; title: string; subtitle: string; icon: React.ReactNode; color: string; bgColor: string };

const HR_CARDS: CardDef[] = [
  {
    id: "NEW_EMPLOYEE",
    title: "موظف جديد",
    subtitle: "إضافة موظف لدليل الموظفين في ثوانٍ",
    icon: <PersonAddRoundedIcon sx={{ fontSize: 30 }} />,
    color: "#2563eb",
    bgColor: "rgba(37, 99, 235, 0.08)",
  },
  {
    id: "RUN_PAYROLL",
    title: "تشغيل مسير رواتب",
    subtitle: "توليد قسائم رواتب الموظفين النشطين لشهر معيّن",
    icon: <PaidRoundedIcon sx={{ fontSize: 30 }} />,
    color: "#16a34a",
    bgColor: "rgba(22, 163, 74, 0.08)",
  },
];

const ME_CARDS: CardDef[] = [
  {
    id: "CHECK_IN_OUT",
    title: "تسجيل حضور / انصراف",
    subtitle: "سجّل حضورك أو انصرافك لليوم",
    icon: <EventAvailableRoundedIcon sx={{ fontSize: 30 }} />,
    color: "#16a34a",
    bgColor: "rgba(22, 163, 74, 0.08)",
  },
  {
    id: "NEW_LEAVE_REQUEST",
    title: "طلب إجازة جديد",
    subtitle: "قدّم طلب إجازة أو مغادرة لمديرك المباشر",
    icon: <FactCheckRoundedIcon sx={{ fontSize: 30 }} />,
    color: "#E21E26",
    bgColor: "rgba(226, 30, 38, 0.08)",
  },
];

const TITLES: Record<QuickActionView, string> = {
  HUB: "إجراء سريع",
  NEW_EMPLOYEE: "موظف جديد",
  RUN_PAYROLL: "تشغيل مسير رواتب",
  CHECK_IN_OUT: "تسجيل حضور / انصراف",
  NEW_LEAVE_REQUEST: "طلب إجازة جديد",
  SUCCESS: "تم بنجاح",
};

export default function QuickActionsModal({ area, open, onClose }: { area: QuickActionArea; open: boolean; onClose: () => void }) {
  const [view, setView] = useState<QuickActionView>("HUB");
  const [data, setData] = useState<Awaited<ReturnType<typeof getQuickActionsBootstrapData>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [successPayload, setSuccessPayload] = useState<QuickSuccessPayload | null>(null);

  const cards = area === "hr" ? HR_CARDS : ME_CARDS;

  useEffect(() => {
    if (!open) return;
    setView("HUB");
    setSuccessPayload(null);
    setLoading(true);
    getQuickActionsBootstrapData()
      .then(setData)
      .finally(() => setLoading(false));
  }, [open]);

  const handleSuccess = (payload: QuickSuccessPayload) => {
    setSuccessPayload(payload);
    setView("SUCCESS");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={view === "HUB" ? "sm" : "xs"} fullWidth PaperProps={{ sx: { borderRadius: 3.5 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2, px: 3, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          {view !== "HUB" && view !== "SUCCESS" && (
            <IconButton size="small" onClick={() => setView("HUB")} sx={{ color: "text.secondary" }}>
              <ArrowForwardRoundedIcon />
            </IconButton>
          )}
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: "rgba(226,30,38,0.1)", color: "primary.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BoltRoundedIcon fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight={800}>
            {TITLES[view]}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {loading && !data ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <>
            {view === "HUB" && (
              <Grid container spacing={2}>
                {cards.map((c) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={c.id}>
                    <Paper
                      elevation={0}
                      onClick={() => setView(c.id)}
                      sx={{
                        p: 2.5,
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderRadius: 3,
                        border: "1.5px solid",
                        borderColor: "divider",
                        cursor: "pointer",
                        "&:hover": { borderColor: c.color, bgcolor: c.bgColor },
                      }}
                    >
                      <Box sx={{ width: 50, height: 50, borderRadius: 2.5, bgcolor: c.bgColor, color: c.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {c.icon}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={800}>
                          {c.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.subtitle}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}

            {view === "NEW_EMPLOYEE" && data && (
              <QuickEmployeeForm departments={data.departments} jobTitles={data.jobTitles} onSuccess={handleSuccess} onCancel={() => setView("HUB")} />
            )}
            {view === "RUN_PAYROLL" && <QuickPayrollForm onSuccess={handleSuccess} onCancel={() => setView("HUB")} />}
            {view === "CHECK_IN_OUT" && <QuickCheckInOut onSuccess={handleSuccess} />}
            {view === "NEW_LEAVE_REQUEST" && data && (
              <QuickLeaveRequestForm leaveTypes={data.leaveTypes} onSuccess={handleSuccess} onCancel={() => setView("HUB")} />
            )}
            {view === "SUCCESS" && successPayload && (
              <QuickSuccessScreen payload={successPayload} onReset={() => setView("HUB")} onClose={onClose} />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
