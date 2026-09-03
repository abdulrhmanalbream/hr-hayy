import { db } from "@/lib/db";
import DocumentTypesClient from "./_components/DocumentTypesClient";

export default async function DocumentTypesPage() {
  const rows = await db.documentType.findMany({ orderBy: { sortOrder: "asc" } });
  return <DocumentTypesClient rows={rows} />;
}
