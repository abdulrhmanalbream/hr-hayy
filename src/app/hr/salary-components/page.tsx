import { db } from "@/lib/db";
import SalaryComponentsClient from "./_components/SalaryComponentsClient";

export default async function SalaryComponentsPage() {
  const rows = await db.salaryComponent.findMany({ orderBy: { sortOrder: "asc" } });
  return <SalaryComponentsClient rows={rows} />;
}
