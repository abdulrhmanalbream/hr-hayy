import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * Signed-cookie session (jose, HS256). Edge-safe: imported from middleware.ts
 * too, so no "server-only" here.
 */

export const STAFF_COOKIE = "personnel_staff";
const MAX_AGE = 60 * 60 * 12; // 12 hours

export type StaffRole = "HR_ADMIN" | "MANAGER" | "EMPLOYEE";

/** One of the area shells a role may enter. */
export type StaffArea = "hr" | "manager" | "me";
const AREA_PRIORITY: StaffArea[] = ["hr", "manager", "me"];

/** Every role can reach /me (self-service); hr/manager are role-gated. */
export function areasForRole(role: StaffRole): StaffArea[] {
  if (role === "HR_ADMIN") return ["hr", "manager", "me"];
  if (role === "MANAGER") return ["manager", "me"];
  return ["me"];
}

export type StaffSession = JWTPayload & {
  kind: "staff";
  id: string;
  role: StaffRole;
  areas: StaffArea[];
  name: string;
  username: string;
  employeeId: string | null;
};

export function isValidStaffSession(payload: JWTPayload | null): payload is StaffSession {
  return (
    !!payload &&
    payload.kind === "staff" &&
    typeof (payload as StaffSession).id === "string" &&
    Array.isArray((payload as StaffSession).areas)
  );
}

/** First accessible area shell for this session, by fixed priority. */
export function roleHome(areas: readonly string[] | null | undefined): string {
  const found = AREA_PRIORITY.find((a) => areas?.includes(a));
  return found ? `/${found}` : "/login";
}

function key(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Missing AUTH_SECRET");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
}

export async function verifySession<T extends JWTPayload = JWTPayload>(
  token: string | undefined,
): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return payload as T;
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};
