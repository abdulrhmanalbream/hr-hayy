/** Pure payroll calculation helpers — no DB access, easy to reason about/test. */

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Approximate daily rate used for absence deductions (30-day month convention). */
export function dailyRate(baseSalary: number): number {
  return baseSalary / 30;
}

export function computeAbsenceDeduction(baseSalary: number, absentDays: number): number {
  return roundMoney(dailyRate(baseSalary) * absentDays);
}

/** GOSI is a placeholder percentage from Settings — no real GOSI API integration in v1. */
export function computeGosiDeduction(baseSalary: number, gosiPercent: number): number {
  return roundMoney((baseSalary * gosiPercent) / 100);
}

export type PayslipLineItem = { key: string; nameAr: string; type: "EARNING" | "DEDUCTION"; amount: number };

export function sumLineItems(items: PayslipLineItem[], type: "EARNING" | "DEDUCTION"): number {
  return roundMoney(items.filter((i) => i.type === type).reduce((sum, i) => sum + i.amount, 0));
}
