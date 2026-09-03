import { NextResponse, type NextRequest } from "next/server";
import {
  STAFF_COOKIE,
  verifySession,
  roleHome,
  isValidStaffSession,
  type StaffSession,
  type StaffArea,
} from "@/lib/auth/session";
import { verifyGroupSession, HAYY_SSO_COOKIE } from "@/lib/auth/groupSession";

const AREA_KEYS: Record<string, StaffArea> = {
  "/hr": "hr",
  "/manager": "manager",
  "/me": "me",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const area = Object.keys(AREA_KEYS).find(
    (a) => pathname === a || pathname.startsWith(a + "/"),
  );
  if (area) {
    const session = await verifySession<StaffSession>(req.cookies.get(STAFF_COOKIE)?.value);
    if (!isValidStaffSession(session)) {
      // Cross-app SSO: a valid sso.hayy.sa bridge cookie means the browser
      // already authenticated there — try to silently establish a session
      // for that identity before falling back to a manual login.
      const groupIdentity = await verifyGroupSession(req.cookies.get(HAYY_SSO_COOKIE)?.value);
      if (groupIdentity) {
        const bridgeUrl = new URL("/api/auth/sso-bridge", req.url);
        bridgeUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(bridgeUrl);
      }
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (!session.areas.includes(AREA_KEYS[area])) {
      return NextResponse.redirect(new URL(roleHome(session.areas), req.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/login") {
    const session = await verifySession<StaffSession>(req.cookies.get(STAFF_COOKIE)?.value);
    if (isValidStaffSession(session)) {
      return NextResponse.redirect(new URL(roleHome(session.areas), req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/hr/:path*", "/manager/:path*", "/me/:path*", "/login"],
};
