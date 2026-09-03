import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/passwords";
import { signSession, cookieOptions, STAFF_COOKIE, areasForRole } from "@/lib/auth/session";
import { isRateLimited, recordFailedAttempt, clearAttempts, clientIp } from "@/lib/auth/rateLimit";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json().catch(() => ({}));
  if (!username || !password) {
    return NextResponse.json({ error: "أدخل اسم المستخدم وكلمة المرور" }, { status: 400 });
  }

  const identifier = String(username).trim();
  const key = `staff:${clientIp(req)}:${identifier.toLowerCase()}`;
  if (isRateLimited(key)) {
    return NextResponse.json(
      { error: "محاولات كثيرة جداً، حاول مرة أخرى بعد قليل" },
      { status: 429 },
    );
  }

  const user = await db.staffUser.findFirst({
    where: { OR: [{ username: identifier }, { email: identifier.toLowerCase() }] },
    include: { employee: { select: { id: true } } },
  });
  if (!user || !user.isActive || !verifyPassword(String(password), user.passwordHash)) {
    recordFailedAttempt(key);
    return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
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
