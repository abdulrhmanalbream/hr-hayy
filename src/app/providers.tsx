"use client";
import { useEffect, useMemo, useState } from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { makeTheme } from "@/theme";

function MuiWithMode({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme();
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMode(resolvedTheme === "dark" ? "dark" : "light");
  }, [resolvedTheme]);

  const theme = useMemo(() => makeTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
      <ToastContainer
        position="bottom-left"
        rtl
        theme={mode === "dark" ? "dark" : "colored"}
        autoClose={3500}
      />
    </ThemeProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
      <MuiWithMode>{children}</MuiWithMode>
    </NextThemesProvider>
  );
}
