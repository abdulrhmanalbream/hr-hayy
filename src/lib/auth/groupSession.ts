import { jwtVerify, type JWTPayload } from "jose";

/**
 * Verifies the cross-app "hayy.sa family" bridge token issued by the SSO
 * app (sso.hayy.sa) — a cookie scoped to the whole `.hayy.sa` domain, so it
 * arrives here automatically once the browser has it. Edge-safe (no DB): a
 * valid token only proves *identity* (email), never a role — this app still
 * decides authorization itself by looking up a matching StaffUser, exactly
 * like the existing "Sign in with Google" flow already does.
 *
 * Shares SSO_SHARED_SECRET with the SSO app (and hdc) — a value distinct
 * from this app's own AUTH_SECRET, so a leak of one doesn't compromise
 * the others.
 */

export const HAYY_SSO_COOKIE = "hayy_sso";

export type HayySsoPayload = JWTPayload & {
  kind: "hayy-sso";
  email: string;
  name: string;
};

function key(): Uint8Array {
  const secret = process.env.SSO_SHARED_SECRET;
  if (!secret) throw new Error("Missing SSO_SHARED_SECRET");
  return new TextEncoder().encode(secret);
}

export async function verifyGroupSession(token: string | undefined): Promise<HayySsoPayload | null> {
  if (!token || !process.env.SSO_SHARED_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (payload.kind !== "hayy-sso" || typeof payload.email !== "string") return null;
    return payload as HayySsoPayload;
  } catch {
    return null;
  }
}
