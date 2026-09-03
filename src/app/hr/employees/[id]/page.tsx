import { notFound } from "next/navigation";
import Grid from "@mui/material/Grid2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import dayjs from "dayjs";
import PageHeader from "@/components/PageHeader";
import Money from "@/components/Money";
import {
  getEmployeeDetail,
  listDepartmentOptions,
  listJobTitleOptions,
  listEmployeeOptions,
  listDocumentTypeOptions,
  listSalaryComponentOptions,
} from "@/server/queries/directory";
import { EMPLOYEE_STATUS_AR, EMPLOYMENT_TYPE_AR, GENDER_AR, LEAVE_STATUS_AR, fmtDate, fmtDateTime, monthLabel } from "@/lib/format";
import { serialize } from "@/lib/serialize";
import EditButton from "./_components/EditButton";
import LoginAccountCard from "./_components/LoginAccountCard";
import DocumentsCard from "@/components/DocumentsCard";
import SalaryComponentsCard from "./_components/SalaryComponentsCard";

const d = (v: Date | string | null | undefined) => (v ? dayjs(v).format("YYYY-MM-DD") : "");

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [employee, departments, jobTitles, employees, documentTypes, salaryComponents] = await Promise.all([
    getEmployeeDetail(id),
    listDepartmentOptions(),
    listJobTitleOptions(),
    listEmployeeOptions(),
    listDocumentTypeOptions(),
    listSalaryComponentOptions(),
  ]);
  if (!employee) notFound();

  return (
    <Box>
      <PageHeader
        title={employee.fullName}
        subtitle={`#${employee.employeeNo} — ${employee.jobTitle.name} — ${employee.department.name}`}
        action={
          <EditButton
            employeeId={employee.id}
            departments={departments}
            jobTitles={jobTitles}
            managers={employees}
            initial={{
              fullName: employee.fullName,
              nationalId: employee.nationalId,
              nationality: employee.nationality ?? "",
              gender: employee.gender ?? "",
              birthDate: d(employee.birthDate),
              phone: employee.phone,
              email: employee.email ?? "",
              departmentId: employee.departmentId,
              jobTitleId: employee.jobTitleId,
              managerId: employee.managerId ?? "",
              hireDate: d(employee.hireDate),
              employmentType: employee.employmentType,
              status: employee.status,
              iqamaExpiry: d(employee.iqamaExpiry),
              contractExpiry: d(employee.contractExpiry),
              bankName: employee.bankName ?? "",
              bankIban: employee.bankIban ?? "",
              baseSalary: String(employee.baseSalary),
              gosiExempt: employee.gosiExempt,
            }}
          />
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
                  البيانات الأساسية
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Row label="الحالة">
                    <Chip size="small" label={EMPLOYEE_STATUS_AR[employee.status]} />
                  </Row>
                  <Row label="رقم الهوية/الإقامة" value={employee.nationalId} />
                  <Row label="الجنسية" value={employee.nationality ?? "—"} />
                  <Row label="الجنس" value={employee.gender ? GENDER_AR[employee.gender] : "—"} />
                  <Row label="الجوال" value={employee.phone} />
                  <Row label="البريد الإلكتروني" value={employee.email ?? "—"} />
                  <Row label="المدير المباشر" value={employee.manager?.fullName ?? "—"} />
                  <Row label="نوع الدوام" value={EMPLOYMENT_TYPE_AR[employee.employmentType]} />
                  <Row label="تاريخ التعيين" value={fmtDate(employee.hireDate)} />
                  <Row label="انتهاء الإقامة" value={fmtDate(employee.iqamaExpiry)} />
                  <Row label="انتهاء العقد" value={fmtDate(employee.contractExpiry)} />
                  <Row label="البنك" value={employee.bankName ?? "—"} />
                  <Row label="الآيبان" value={employee.bankIban ?? "—"} />
                  <Divider sx={{ my: 0.5 }} />
                  <Row label="الراتب الأساسي">
                    <Money value={employee.baseSalary.toString()} />
                  </Row>
                </Box>
              </CardContent>
            </Card>

            <LoginAccountCard employeeId={employee.id} staffUser={employee.staffUser} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <SalaryComponentsCard
              employeeId={employee.id}
              allComponents={salaryComponents}
              assignments={serialize(employee.salaryComponents)}
              baseSalary={employee.baseSalary.toString()}
            />

            <DocumentsCard employeeId={employee.id} documentTypes={documentTypes} documents={employee.documents} />

            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
                  آخر سجلات الحضور
                </Typography>
                {employee.attendanceRecords.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    لا توجد سجلات حضور
                  </Typography>
                )}
                {employee.attendanceRecords.slice(0, 10).map((r) => (
                  <Box key={r.id} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Typography variant="body2">{fmtDate(r.date)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {r.checkIn ? fmtDateTime(r.checkIn).split(" ").pop() : "—"} → {r.checkOut ? fmtDateTime(r.checkOut).split(" ").pop() : "—"}
                    </Typography>
                    <Chip size="small" label={r.status} />
                  </Box>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
                  طلبات الإجازة
                </Typography>
                {employee.leaveRequests.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    لا توجد طلبات
                  </Typography>
                )}
                {employee.leaveRequests.map((r) => (
                  <Box key={r.id} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Typography variant="body2">
                      {r.leaveType.nameAr} ({fmtDate(r.startDate)} → {fmtDate(r.endDate)})
                    </Typography>
                    <Chip size="small" label={LEAVE_STATUS_AR[r.status]} />
                  </Box>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
                  قسائم الراتب
                </Typography>
                {employee.payslips.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    لا توجد قسائم بعد
                  </Typography>
                )}
                {employee.payslips.map((p) => (
                  <Box key={p.id} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Typography variant="body2">{monthLabel(p.payrollRun.periodYear, p.payrollRun.periodMonth)}</Typography>
                    <Money value={p.netSalary.toString()} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      {children ?? <Typography variant="body2">{value}</Typography>}
    </Box>
  );
}
