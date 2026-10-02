import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "rf_admin_session";
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.ADMIN_PASSWORD ||
  "reviewflow_admin_secret_key_2026";

function getExpectedAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_PIN || "admin123";
}

function createSessionToken(maxAgeDays = 30): string {
  const expiresAt = Date.now() + maxAgeDays * 24 * 60 * 60 * 1000;
  const payload = `admin:${expiresAt}`;
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}:${hmac}`;
}

function verifySessionToken(token: string): boolean {
  if (!token) return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [role, expiresAtStr, signature] = parts;
  if (role !== "admin") return false;

  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  const payload = `admin:${expiresAtStr}`;
  const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

/**
 * GET /api/auth
 * Check if the user has an active authenticated admin session
 */
export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = sessionCookie ? verifySessionToken(sessionCookie) : false;

  return NextResponse.json({
    authenticated: isAuthenticated,
  });
}

/**
 * POST /api/auth
 * Authenticate with the administrator password / PIN
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, rememberMe = true } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password or security PIN is required" },
        { status: 400 }
      );
    }

    const expectedPassword = getExpectedAdminPassword();

    // Constant-time comparison to prevent timing attacks
    const passwordBuffer = Buffer.from(String(password).trim());
    const expectedBuffer = Buffer.from(expectedPassword.trim());

    const isMatch =
      passwordBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(passwordBuffer, expectedBuffer);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Incorrect password or security PIN. Customer access is restricted." },
        { status: 401 }
      );
    }

    const maxAgeDays = rememberMe ? 30 : 1;
    const token = createSessionToken(maxAgeDays);

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful",
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeDays * 24 * 60 * 60,
    });

    return response;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Authentication error";
    return NextResponse.json(
      { success: false, error: "Failed to process authentication", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth
 * Log out and clear the session cookie
 */
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.delete(SESSION_COOKIE_NAME);

  return response;
}
