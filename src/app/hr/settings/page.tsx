import { db } from "@/lib/db";
import SettingsClient from "./_components/SettingsClient";

export default async function SettingsPage() {
  const setting = await db.setting.findUnique({ where: { key: "gosi_percent" } });
  return <SettingsClient gosiPercent={setting?.value ?? "9.75"} />;
}
