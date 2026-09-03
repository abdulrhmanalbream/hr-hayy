/**
 * Seed data: departments, job titles, leave/document/salary types, and the
 * company's real roster. No fabricated attendance/leave history is generated
 * for real people — the system starts with a clean slate for them.
 * Run after `npm run db:push`:  npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "node:crypto";
import dayjs from "dayjs";

const db = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`;
}

async function main() {
  console.log("🌱 Seeding personnel database...");

  // ── Departments & job titles ──────────────────────────────────────────
  const mgmtDept = await db.department.create({ data: { name: "الإدارة العليا" } });
  const hrDept = await db.department.create({ data: { name: "الموارد البشرية" } });
  await db.department.create({ data: { name: "الهندسة والتطوير" } });
  await db.department.create({ data: { name: "المالية" } });
  const generalDept = await db.department.create({ data: { name: "عام" } });

  const jtCeo = await db.jobTitle.create({ data: { name: "الرئيس التنفيذي" } });
  await db.jobTitle.create({ data: { name: "مدير الموارد البشرية" } });
  const jtHrSpecialist = await db.jobTitle.create({ data: { name: "أخصائي موارد بشرية" } });
  await db.jobTitle.create({ data: { name: "مدير هندسة" } });
  await db.jobTitle.create({ data: { name: "مطوّر برمجيات" } });
  await db.jobTitle.create({ data: { name: "محاسب" } });
  const jtExecManager = await db.jobTitle.create({ data: { name: "مدير تنفيذي" } });
  const jtStaff = await db.jobTitle.create({ data: { name: "موظف" } });

  // ── Document types ────────────────────────────────────────────────────
  await db.documentType.createMany({
    data: [
      { key: "iqama", labelAr: "الإقامة", hasExpiry: true, required: true, sortOrder: 1 },
      { key: "national_id", labelAr: "الهوية الوطنية", hasExpiry: true, required: false, sortOrder: 2 },
      { key: "contract", labelAr: "عقد العمل", hasExpiry: true, required: true, sortOrder: 3 },
      { key: "cv", labelAr: "السيرة الذاتية", hasExpiry: false, required: false, sortOrder: 4 },
      { key: "certificate", labelAr: "الشهادة العلمية", hasExpiry: false, required: false, sortOrder: 5 },
    ],
  });

  // ── Leave types ────────────────────────────────────────────────────────
  await db.leaveType.create({ data: { key: "annual", nameAr: "إجازة سنوية", annualDays: 21, isPaid: true, sortOrder: 1 } });
  await db.leaveType.create({ data: { key: "sick", nameAr: "إجازة مرضية", annualDays: 30, isPaid: true, sortOrder: 2 } });
  await db.leaveType.create({ data: { key: "unpaid", nameAr: "إجازة بدون راتب", annualDays: null, isPaid: false, sortOrder: 3 } });
  await db.leaveType.create({ data: { key: "permission", nameAr: "مغادرة", annualDays: null, isPaid: true, sortOrder: 4 } });

  // ── Salary components ─────────────────────────────────────────────────
  await db.salaryComponent.create({ data: { key: "basic", nameAr: "أساسي", type: "EARNING", isSystem: true, sortOrder: 1 } });
  await db.salaryComponent.create({ data: { key: "housing_allowance", nameAr: "بدل سكن", type: "EARNING", sortOrder: 2 } });
  await db.salaryComponent.create({ data: { key: "transport_allowance", nameAr: "بدل نقل", type: "EARNING", sortOrder: 3 } });
  await db.salaryComponent.create({ data: { key: "loan_deduction", nameAr: "خصم قرض", type: "DEDUCTION", sortOrder: 4 } });
  await db.salaryComponent.create({ data: { key: "other_deduction", nameAr: "خصم آخر", type: "DEDUCTION", sortOrder: 5 } });
  const bonusComponent = await db.salaryComponent.create({ data: { key: "bonus", nameAr: "مكافأة سنوية", type: "EARNING", sortOrder: 6 } });
  await db.salaryComponent.create({ data: { key: "performance_bonus", nameAr: "مكافأة أداء", type: "EARNING", sortOrder: 7 } });
  await db.salaryComponent.create({ data: { key: "achievement_bonus", nameAr: "مكافأة إنجاز", type: "EARNING", sortOrder: 8 } });

  await db.setting.upsert({ where: { key: "gosi_percent" }, create: { key: "gosi_percent", value: "9.75" }, update: {} });

  // ── Real roster ──────────────────────────────────────────────────────
  // Base salary, national ID, and phone are placeholders (0 / sequential) —
  // no real figures were given; fill them in from each employee's page.
  const today = dayjs().toDate();
  let seq = 1;
  const placeholderId = () => `0000000${String(seq).padStart(3, "0")}`;
  const placeholderPhone = () => `05000000${String(seq++).padStart(2, "0")}`;

  const ceoUser = await db.staffUser.create({
    data: { username: "admin", name: "عبدالرحمن البريم", passwordHash: hashPassword("admin1234"), role: "HR_ADMIN" },
  });
  const ceoEmployee = await db.employee.create({
    data: {
      fullName: ceoUser.name,
      nationalId: placeholderId(),
      phone: placeholderPhone(),
      departmentId: mgmtDept.id,
      jobTitleId: jtCeo.id,
      hireDate: today,
      baseSalary: 0,
      gosiExempt: true, // بدون خصومات — مكافأة بدلاً من ذلك
      staffUserId: ceoUser.id,
    },
  });
  await db.employeeSalaryComponent.create({ data: { employeeId: ceoEmployee.id, componentId: bonusComponent.id, amount: 0 } });

  // مديران تنفيذيان تحت الإدارة العليا، بدون مدير مباشر
  await db.employee.create({
    data: {
      fullName: "م. صفية",
      nationalId: placeholderId(),
      phone: placeholderPhone(),
      departmentId: mgmtDept.id,
      jobTitleId: jtExecManager.id,
      hireDate: today,
      baseSalary: 0,
    },
  });
  await db.employee.create({
    data: {
      fullName: "عبدالله كردي",
      nationalId: placeholderId(),
      phone: placeholderPhone(),
      departmentId: mgmtDept.id,
      jobTitleId: jtExecManager.id,
      hireDate: today,
      baseSalary: 0,
    },
  });

  await db.employee.create({
    data: {
      fullName: "رغد",
      nationalId: placeholderId(),
      phone: placeholderPhone(),
      departmentId: hrDept.id,
      jobTitleId: jtHrSpecialist.id,
      hireDate: today,
      baseSalary: 0,
    },
  });

  for (const name of ["سارة", "جهاد كوني", "نواف الحربي"]) {
    await db.employee.create({
      data: {
        fullName: name,
        nationalId: placeholderId(),
        phone: placeholderPhone(),
        departmentId: generalDept.id,
        jobTitleId: jtStaff.id,
        hireDate: today,
        baseSalary: 0,
      },
    });
  }

  console.log("✅ Seed complete.");
  console.log("   HR admin login: admin / admin1234");
  console.log("   Base salaries, national IDs, and phone numbers are placeholders — fill them in per employee.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
