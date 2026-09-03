"use client";
import Button from "@mui/material/Button";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";

export default function PrintButton() {
  return (
    <Button variant="outlined" startIcon={<PrintRoundedIcon />} onClick={() => window.print()}>
      طباعة
    </Button>
  );
}
