import { db } from "@/lib/db";
import { serialize } from "@/lib/serialize";
import PayrollRunsClient from "./_components/PayrollRunsClient";

export default async function PayrollPage() {
  const rows = await db.payrollRun.findMany({ orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }] });
  return <PayrollRunsClient rows={serialize(rows)} />;
}
