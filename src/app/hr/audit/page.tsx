import { db } from "@/lib/db";
import AuditTable from "./_components/AuditTable";

export default async function AuditPage() {
  const rows = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  return <AuditTable rows={rows} />;
}
