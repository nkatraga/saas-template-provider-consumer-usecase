import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "";
const ACCESS_TOKEN_EXPIRY = 60 * 60; // 1 hour
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60; // 30 days

interface TokenPayload {
  userId: string;
  email: string;
  type: "access" | "refresh";
  iat: number;
  exp: number;
}

function base64url(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString("utf8");
}

function hmacSign(input: string): string {
  return createHmac("sha256", SECRET)
    .update(input)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function sign(
  userId: string,
  email: string,
  type: "access" | "refresh" = "access"
): string {
  const now = Math.floor(Date.now() / 1000);
  const exp =
    type === "access" ? now + ACCESS_TOKEN_EXPIRY : now + REFRESH_TOKEN_EXPIRY;

  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ userId, email, type, iat: now, exp })
  );
  const signature = hmacSign(`${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
}

export async function verify(
  token: string
): Promise<TokenPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSig = hmacSign(`${header}.${payload}`);

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    const decoded = JSON.parse(base64urlDecode(payload)) as TokenPayload;

    // Check expiration
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;

    return decoded;
  } catch {
    return null;
  }
}
