/**
 * ترتيب طبيعي (natural sort) للنصوص التي تحتوي أرقاماً — يمنع ترتيب "موظف 10"
 * قبل "موظف 2" لأن المقارنة النصية تقارن حرفاً بحرف.
 */
const collator = new Intl.Collator(["ar", "en"], {
  numeric: true,
  sensitivity: "base",
});

export function compareNatural(a: string, b: string): number {
  return collator.compare(a, b);
}

export function compareNaturalAny(a: unknown, b: unknown): number {
  const aEmpty = a == null || a === "";
  const bEmpty = b == null || b === "";
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return -1;
  if (bEmpty) return 1;

  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();

  return collator.compare(String(a), String(b));
}
