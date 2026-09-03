import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyGoogleIdToken } from "@/lib/auth/google";
import { signSession, cookieOptions, STAFF_COOKIE, areasForRole } from "@/lib/auth/session";
import { isRateLimited, recordFailedAttempt, clearAttempts, clientIp } from "@/lib/auth/rateLimit";

export async function POST(req: NextRequest) {
  const { credential } = await req.json().catch(() => ({}));
  if (!credential) {
    return NextResponse.json({ error: "بيانات دخول Google غير صالحة" }, { status: 400 });
  }

  const key = `staff-google:${clientIp(req)}`;
  if (isRateLimited(key)) {
    return NextResponse.json(
      { error: "محاولات كثيرة جداً، حاول مرة أخرى بعد قليل" },
      { status: 429 },
    );
  }

  const identity = await verifyGoogleIdToken(String(credential));
  if (!identity) {
    recordFailedAttempt(key);
    return NextResponse.json({ error: "تعذر التحقق من حساب Google" }, { status: 401 });
  }

  const user = await db.staffUser.findUnique({
    where: { email: identity.email },
    include: { employee: { select: { id: true } } },
  });
  if (!user || !user.isActive) {
    recordFailedAttempt(key);
    return NextResponse.json(
      { error: "لا يوجد حساب موظف مرتبط بهذا البريد — تواصل مع مسؤول الموارد البشرية لربط بريدك" },
      { status: 401 },
    );
  }
  clearAttempts(key);

  const areas = areasForRole(user.role);
  const token = await signSession({
    kind: "staff",
    id: user.id,
    role: user.role,
    areas,
    name: user.name,
    username: user.username,
    employeeId: user.employee?.id ?? null,
  });

  const res = NextResponse.json({ ok: true, role: user.role, areas });
  res.cookies.set(STAFF_COOKIE, token, cookieOptions);
  return res;
}
