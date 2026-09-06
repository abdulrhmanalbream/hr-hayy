import { NextResponse, type NextRequest } from "next/server";
import {
  STAFF_COOKIE,
  verifySession,
  roleHome,
  isValidStaffSession,
  type StaffSession,
  type StaffArea,
} from "@/lib/auth/session";

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
      // Cross-app SSO: arriving with ?sso_token= means the SSO dashboard's
      // HR tile sent us through /api/auth/authorize, which already
      // confirmed the user there. Hand the token to the bridge route (Node
      // runtime, needed for the StaffUser lookup) instead of verifying it
      // here — a *missing* token is the common case (direct/bookmarked
      // visits keep working exactly as before), so don't do that check
      // twice.
      const ssoToken = req.nextUrl.searchParams.get("sso_token");
      if (ssoToken) {
        const bridgeUrl = new URL("/api/auth/sso-bridge", req.url);
        bridgeUrl.searchParams.set("token", ssoToken);
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
