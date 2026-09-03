import { getStaffSession } from "@/lib/auth/current";
import { listMyTeam } from "@/server/queries/team";
import TeamTable from "./_components/TeamTable";

export default async function TeamPage() {
  const session = await getStaffSession();
  const rows = await listMyTeam(session!.employeeId!);
  return <TeamTable rows={rows} />;
}
