import { listEmployeesForDirectory, listDepartmentOptions, listJobTitleOptions } from "@/server/queries/directory";
import { serialize } from "@/lib/serialize";
import EmployeesClient from "./_components/EmployeesClient";

export default async function EmployeesPage() {
  const [rows, departments, jobTitles] = await Promise.all([
    listEmployeesForDirectory(),
    listDepartmentOptions(),
    listJobTitleOptions(),
  ]);
  return <EmployeesClient rows={serialize(rows)} departments={departments} jobTitles={jobTitles} />;
}
