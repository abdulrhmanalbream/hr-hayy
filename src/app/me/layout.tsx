import { requireArea } from "@/lib/auth/current";
import DashboardShell from "@/components/layout/DashboardShell";
import { ME_NAV } from "@/components/layout/nav";
import { ROLE_AR } from "@/lib/format";

export default async function MeLayout({ children }: { children: React.ReactNode }) {
  const session = await requireArea("me");
  return (
    <DashboardShell nav={ME_NAV} userName={session.name} userRoleLabel={ROLE_AR[session.role]} quickActionArea="me">
      {children}
    </DashboardShell>
  );
}
