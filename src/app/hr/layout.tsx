import { requireArea } from "@/lib/auth/current";
import DashboardShell from "@/components/layout/DashboardShell";
import { HR_NAV } from "@/components/layout/nav";
import { ROLE_AR } from "@/lib/format";

export default async function HrLayout({ children }: { children: React.ReactNode }) {
  const session = await requireArea("hr");
  return (
    <DashboardShell nav={HR_NAV} userName={session.name} userRoleLabel={ROLE_AR[session.role]} quickActionArea="hr">
      {children}
    </DashboardShell>
  );
}
