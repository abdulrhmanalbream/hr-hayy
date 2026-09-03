"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import QuickActionsModal from "./QuickActionsModal";
import type { QuickActionArea } from "./types";

export type { QuickActionArea };

export default function QuickActionButton({ area }: { area: QuickActionArea }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="إجراء سريع" arrow>
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          startIcon={<AddRoundedIcon sx={{ fontSize: 20 }} />}
          sx={{
            display: { xs: "none", sm: "flex" },
            bgcolor: "#16a34a",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "0.875rem",
            px: 2,
            py: 0.7,
            borderRadius: 2.5,
            boxShadow: "0 2px 10px rgba(22, 163, 74, 0.28)",
            textTransform: "none",
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: "#15803d", transform: "translateY(-1px)" },
          }}
        >
          إجراء سريع
        </Button>
      </Tooltip>

      <Tooltip title="إجراء سريع" arrow>
        <IconButton
          onClick={() => setOpen(true)}
          sx={{ display: { xs: "flex", sm: "none" }, bgcolor: "#16a34a", color: "#ffffff" }}
          size="small"
        >
          <AddRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <QuickActionsModal area={area} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
