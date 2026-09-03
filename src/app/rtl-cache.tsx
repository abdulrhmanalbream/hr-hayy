"use client";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";

/** Emotion cache with RTL flipping — must live in a client component. */
export default function RtlCacheProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui", stylisPlugins: [prefixer, rtlPlugin] }}>
      {children}
    </AppRouterCacheProvider>
  );
}
