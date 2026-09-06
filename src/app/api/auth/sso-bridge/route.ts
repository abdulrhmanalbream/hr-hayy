import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyBridgeToken } from "@/lib/auth/groupSession";
import { signSession, cookieOptions, STAFF_COOKIE, areasForRole } from "@/lib/auth/session";

/**
 * Cross-app SSO bridge: middleware sends requests here that arrived with a
 * `?sso_token=` from the SSO app's /api/auth/authorize. Verifies that
 * short-lived token server-side (Node runtime, unlike middleware, so it can
 * hit the DB), looks up a StaffUser by its email — same rule as "Sign in
 * with Google": the email must already belong to an active staff account,
 * this never creates one — and if found, signs the normal session and
 * sends the browser on to where it was headed.
 */
export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const identity = await verifyBridgeToken(req.nextUrl.searchParams.get("token"));
  if (!identity) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const user = await db.staffUser.findUnique({
    where: { email: identity.email },
    include: { employee: { select: { id: true } } },
  });
  if (!user || !user.isActive) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", safeNext);
    url.searchParams.set("error", "no_personnel_account");
    return NextResponse.redirect(url);
  }

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

  const res = NextResponse.redirect(new URL(safeNext, req.url));
  res.cookies.set(STAFF_COOKIE, token, cookieOptions);
  return res;
}
