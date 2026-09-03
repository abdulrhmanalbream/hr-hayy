import { db } from "@/lib/db";
import JobTitlesClient from "./_components/JobTitlesClient";

export default async function JobTitlesPage() {
  const rows = await db.jobTitle.findMany({ include: { employees: { select: { id: true } } }, orderBy: { name: "asc" } });
  return <JobTitlesClient rows={rows} />;
}
