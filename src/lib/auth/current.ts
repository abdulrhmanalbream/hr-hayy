import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import {
  STAFF_COOKIE,
  verifySession,
  isValidStaffSession,
  roleHome,
  type StaffSession,
  type StaffArea,
  type StaffRole,
} from "./session";

/** Current staff session (or null). Cached per request. */
export const getStaffSession = cache(async (): Promise<StaffSession | null> => {
  const token = (await cookies()).get(STAFF_COOKIE)?.value;
  const s = await verifySession<StaffSession>(token);
  return isValidStaffSession(s) ? s : null;
});

/** Throws if the current staff user doesn't have one of the given roles. */
export async function requireStaff(...roles: StaffRole[]): Promise<StaffSession> {
  const s = await getStaffSession();
  if (!s) throw new Error("UNAUTHENTICATED");
  if (roles.length && !roles.includes(s.role)) throw new Error("FORBIDDEN");
  return s;
}

/**
 * Gate for area layouts (hr/manager/me), consistent with middleware's area
 * check. Redirects (doesn't throw) on failure: unauthenticated → /login,
 * authenticated-but-wrong-area → own home area.
 */
export async function requireArea(area: StaffArea): Promise<StaffSession> {
  const s = await getStaffSession();
  if (!s) redirect("/login");
  if (!s.areas.includes(area)) redirect(roleHome(s.areas));
  return s;
}
