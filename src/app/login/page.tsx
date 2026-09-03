import { Suspense } from "react";
import type { Metadata } from "next";
import LoginCard from "@/components/auth/LoginCard";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default function StaffLoginPage() {
  return (
    <Suspense>
      <LoginCard />
    </Suspense>
  );
}
