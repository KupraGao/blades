import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// =================================================
// ORDER ACCESS PROOF (guest checkout success)
// =================================================
// Short-lived HMAC-signed httpOnly cookie bound to one orderId.
// Not Admin authorization. Not service-role. No PII in the cookie.
// Requires server-only ORDER_ACCESS_SECRET (never NEXT_PUBLIC_*).
// =================================================

const TTL_SECONDS = 60 * 60 * 24; // 24 hours
const COOKIE_PREFIX = "order_access_";

function cookieNameForOrder(orderId: string) {
  return `${COOKIE_PREFIX}${orderId}`;
}

function getOrderAccessSecret(): string {
  const secret = process.env.ORDER_ACCESS_SECRET;

  if (!secret || !secret.trim()) {
    throw new Error("ORDER_ACCESS_SECRET is not configured.");
  }

  return secret;
}

export function assertOrderAccessSecretConfigured(): void {
  getOrderAccessSecret();
}

function signProof(orderId: string, exp: number): string {
  return createHmac("sha256", getOrderAccessSecret())
    .update(`${orderId}.${exp}`)
    .digest("base64url");
}

function signaturesMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(a, b);
}

function parseProofValue(raw: string): { exp: number; signature: string } | null {
  const separator = raw.indexOf(".");

  if (separator <= 0 || separator === raw.length - 1) {
    return null;
  }

  const expPart = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);

  if (!signature || expPart.includes(".")) {
    return null;
  }

  const exp = Number(expPart);

  if (!Number.isFinite(exp) || !Number.isInteger(exp) || exp <= 0) {
    return null;
  }

  return { exp, signature };
}

export async function issueOrderAccessProof(orderId: string): Promise<void> {
  const trimmedId = orderId.trim();

  if (!trimmedId) {
    throw new Error("Order id is required to issue access proof.");
  }

  // Fail closed if secret missing (do not issue unsigned cookies).
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const signature = signProof(trimmedId, exp);
  const value = `${exp}.${signature}`;

  const cookieStore = await cookies();

  cookieStore.set(cookieNameForOrder(trimmedId), value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function verifyOrderAccessProof(
  orderId: string,
): Promise<boolean> {
  const trimmedId = orderId.trim();

  if (!trimmedId) {
    return false;
  }

  try {
    // Touch secret first so misconfiguration fails closed (deny).
    getOrderAccessSecret();

    const cookieStore = await cookies();
    const raw = cookieStore.get(cookieNameForOrder(trimmedId))?.value;

    if (!raw) {
      return false;
    }

    const parsed = parseProofValue(raw);

    if (!parsed) {
      return false;
    }

    if (parsed.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }

    const expected = signProof(trimmedId, parsed.exp);

    return signaturesMatch(parsed.signature, expected);
  } catch {
    return false;
  }
}

export async function clearOrderAccessProof(orderId: string): Promise<void> {
  const trimmedId = orderId.trim();

  if (!trimmedId) {
    return;
  }

  const cookieStore = await cookies();

  cookieStore.set(cookieNameForOrder(trimmedId), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
