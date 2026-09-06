import { jwtVerify, type JWTPayload } from "jose";

/**
 * Verifies the cross-app "hayy.sa family" login bridge token minted by the
 * SSO app's /api/auth/authorize — arrives as a `sso_token` query param on a
 * redirect from there (see middleware.ts), not a cookie: these apps live on
 * unrelated domains (hayy.sa, vercel.app, a third-party domain), and a
 * cookie fundamentally cannot cross that boundary no matter how it's
 * configured. A valid token only proves *identity* (email), never a role —
 * this app still decides authorization itself by looking up a matching
 * StaffUser, exactly like the existing "Sign in with Google" flow already
 * does.
 *
 * Shares SSO_SHARED_SECRET with the SSO app (and hdc) — a value distinct
 * from this app's own AUTH_SECRET, so a leak of one doesn't compromise the
 * others.
 */

export type HayySsoBridgePayload = JWTPayload & {
  kind: "hayy-sso-bridge";
  email: string;
  name: string;
};

function key(): Uint8Array {
  const secret = process.env.SSO_SHARED_SECRET;
  if (!secret) throw new Error("Missing SSO_SHARED_SECRET");
  return new TextEncoder().encode(secret);
}

export async function verifyBridgeToken(
  token: string | null | undefined,
): Promise<HayySsoBridgePayload | null> {
  if (!token || !process.env.SSO_SHARED_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (payload.kind !== "hayy-sso-bridge" || typeof payload.email !== "string") return null;
    return payload as HayySsoBridgePayload;
  } catch {
    return null;
  }
}
