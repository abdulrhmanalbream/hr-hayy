import { fmtMoney } from "@/lib/format";

/** Amount + السعودي الريال suffix, e.g. "12,500.00 ر.س". */
export default function Money({
  value,
  className = "",
}: {
  value: number | string;
  className?: string;
}) {
  return (
    <span className={className} style={{ whiteSpace: "nowrap" }}>
      {fmtMoney(value)} ر.س
    </span>
  );
}
