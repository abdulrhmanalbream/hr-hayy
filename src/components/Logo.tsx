import Image from "next/image";

export default function Logo({ height = 38 }: { height?: number }) {
  return (
    <Image
      src="/header-logo.svg"
      alt="شركة تطوير الحي"
      width={Math.round((195 / 38) * height)}
      height={height}
      priority
    />
  );
}
