import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import RtlCacheProvider from "./rtl-cache";
import Providers from "./providers";
import "./globals.css";

const arabicFont = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "شركة تطوير الحي — شؤون الموظفين", template: "%s | شؤون الموظفين" },
  description: "نظام شؤون الموظفين — شركة تطوير الحي",
  icons: { icon: "/favicon-32x32.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={arabicFont.variable} suppressHydrationWarning>
        <RtlCacheProvider>
          <Providers>{children}</Providers>
        </RtlCacheProvider>
      </body>
    </html>
  );
}
