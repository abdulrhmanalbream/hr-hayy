import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Verifies a Google Identity Services ID token (the `credential` from the
 * "Sign in with Google" button) against Google's public JWKS. No client
 * secret involved — this is the ID-token flow, not the OAuth code exchange.
 */

const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export type GoogleIdentity = { email: string; name: string };

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity | null> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return null;
  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: clientId,
    });
    if (!payload.email || payload.email_verified !== true) return null;
    return {
      email: String(payload.email).trim().toLowerCase(),
      name: typeof payload.name === "string" && payload.name ? payload.name : String(payload.email),
    };
  } catch {
    return null;
  }
}
