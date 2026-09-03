import { requireArea } from "@/lib/auth/current";
import DashboardShell from "@/components/layout/DashboardShell";
import { MANAGER_NAV } from "@/components/layout/nav";
import { ROLE_AR } from "@/lib/format";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireArea("manager");
  return (
    <DashboardShell nav={MANAGER_NAV} userName={session.name} userRoleLabel={ROLE_AR[session.role]}>
      {children}
    </DashboardShell>
  );
}
