"use client";
import { createTheme, type Theme } from "@mui/material/styles";
import { arSA } from "@mui/material/locale";

/**
 * HDC brand theme — colors derived from header-logo.svg:
 * red #E21E26, dark maroon #851619, cream #F1E8D6.
 * Light + dark palettes, toggled via next-themes.
 */
export const hdcColors = {
  red: "#E21E26",
  maroon: "#851619",
  cream: "#F1E8D6",
  creamBg: "#F8F4EC",
  ink: "#2B2118",
} as const;

export function makeTheme(mode: "light" | "dark"): Theme {
  const dark = mode === "dark";
  const divider = dark ? "#3B322A" : "#EADFCE";
  const paper = dark ? "#221C16" : "#FFFFFF";

  return createTheme(
    {
      direction: "rtl",
      palette: {
        mode,
        primary: { main: hdcColors.red, dark: "#B4151C", light: "#EF5257", contrastText: "#fff" },
        secondary: dark
          ? { main: "#E8B9AF", dark: "#C99287", light: "#F3D4CD", contrastText: "#2B2118" }
          : { main: hdcColors.maroon, dark: "#5E0F11", light: "#A33236", contrastText: "#fff" },
        background: dark
          ? { default: "#171310", paper }
          : { default: hdcColors.creamBg, paper },
        text: dark
          ? { primary: "#F1E8D6", secondary: "#B9AA96" }
          : { primary: hdcColors.ink, secondary: "#6B5E52" },
        success: { main: dark ? "#4CAF6E" : "#1B873F" },
        warning: { main: "#E8A013" },
        error: { main: dark ? "#EF5350" : "#C62828" },
        info: { main: dark ? "#64B5F6" : "#0B6BCB" },
        divider,
      },
      typography: {
        fontFamily: "var(--font-arabic), 'Tajawal', system-ui, -apple-system, 'Segoe UI', sans-serif",
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
        subtitle1: { fontWeight: 500 },
        button: { fontWeight: 700 },
      },
      shape: { borderRadius: 10 },
      components: {
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: { root: { borderRadius: 8 } },
        },
        MuiTextField: { defaultProps: { size: "small" } },
        MuiFormControl: { defaultProps: { size: "small" } },
        MuiCard: {
          styleOverrides: {
            root: {
              border: `1px solid ${divider}`,
              boxShadow: dark ? "none" : "0 1px 3px rgba(43,33,24,0.06)",
              backgroundImage: "none",
            },
          },
        },
        MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: paper,
              color: dark ? "#F1E8D6" : hdcColors.ink,
              boxShadow: "none",
              borderBottom: `1px solid ${divider}`,
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: paper,
              // physical right sidebar: with the rtl stylis plugin this renders as border-left
              borderRight: `1px solid ${divider}`,
            },
          },
        },
        MuiChip: { styleOverrides: { root: { fontWeight: 700 } } },
      },
    },
    arSA,
  );
}
