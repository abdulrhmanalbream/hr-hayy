import { z } from "zod";

export type ActionResult = { ok: true; id?: string; count?: number } | { ok: false; error: string };

/** Map thrown errors to a friendly Arabic message. */
export function failure(e: unknown, prismaMap: Record<string, string> = {}): ActionResult {
  if (e instanceof z.ZodError) {
    return { ok: false, error: e.issues[0]?.message ?? "بيانات غير صالحة" };
  }
  const code = (e as { code?: string })?.code;
  if (code && prismaMap[code]) return { ok: false, error: prismaMap[code] };
  const msg = (e as Error)?.message;
  if (msg === "UNAUTHENTICATED") return { ok: false, error: "الجلسة منتهية — سجّل الدخول من جديد" };
  if (msg === "FORBIDDEN") return { ok: false, error: "ليس لديك صلاحية لهذا الإجراء" };
  console.error(e);
  return { ok: false, error: "حدث خطأ غير متوقع" };
}
