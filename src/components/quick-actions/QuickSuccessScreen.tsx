import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import type { QuickSuccessPayload } from "./types";

export default function QuickSuccessScreen({
  payload,
  onReset,
  onClose,
}: {
  payload: QuickSuccessPayload;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <Box sx={{ textAlign: "center", py: 3 }}>
      <CheckCircleRoundedIcon sx={{ fontSize: 56, color: "#16a34a", mb: 1.5 }} />
      <Typography variant="h6" fontWeight={800}>
        {payload.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        {payload.subtitle}
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
        <Button variant="outlined" onClick={onReset}>
          إجراء آخر
        </Button>
        <Button variant="contained" onClick={onClose}>
          تم
        </Button>
      </Box>
    </Box>
  );
}
