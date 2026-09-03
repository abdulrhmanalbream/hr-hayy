import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { db } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import Money from "@/components/Money";
import DocumentsCard from "@/components/DocumentsCard";
import { getStaffSession } from "@/lib/auth/current";
import { EMPLOYEE_STATUS_AR, EMPLOYMENT_TYPE_AR, fmtDate } from "@/lib/format";

export default async function MyProfilePage() {
  const session = await getStaffSession();
  const [employee, documentTypes] = await Promise.all([
    db.employee.findUnique({
      where: { id: session!.employeeId! },
      include: { department: true, jobTitle: true, manager: { select: { fullName: true } }, documents: { include: { type: true }, orderBy: { createdAt: "desc" } } },
    }),
    db.documentType.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  if (!employee) return null;

  return (
    <Box>
      <PageHeader title="ملفي الشخصي" subtitle={`#${employee.employeeNo}`} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
                البيانات الأساسية
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Row label="الاسم" value={employee.fullName} />
                <Row label="القسم" value={employee.department.name} />
                <Row label="المسمى الوظيفي" value={employee.jobTitle.name} />
                <Row label="المدير المباشر" value={employee.manager?.fullName ?? "—"} />
                <Row label="الحالة" value={EMPLOYEE_STATUS_AR[employee.status]} />
                <Row label="نوع الدوام" value={EMPLOYMENT_TYPE_AR[employee.employmentType]} />
                <Row label="تاريخ التعيين" value={fmtDate(employee.hireDate)} />
                <Row label="الجوال" value={employee.phone} />
                <Row label="البريد الإلكتروني" value={employee.email ?? "—"} />
                <Row label="الراتب الأساسي">
                  <Money value={employee.baseSalary.toString()} />
                </Row>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <DocumentsCard employeeId={employee.id} documentTypes={documentTypes} documents={employee.documents} />
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
