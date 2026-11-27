import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function POST(request: NextRequest) {
  const cookie = request.headers.get("cookie") ?? "";

  try {
    await fetch(`${API}/api/auth/logout`, {
      method: "POST",
      headers: cookie ? { cookie } : undefined,
      cache: "no-store",
    });
  } catch {
    // Even if the backend is unreachable, clear the browser cookie below.
  }

  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  response.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
