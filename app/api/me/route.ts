import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function GET(request: NextRequest) {
  const cookie = request.headers.get("cookie") ?? "";
  if (!cookie) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${API}/api/auth/me`, {
      method: "GET",
      headers: { cookie },
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ user: null }, { status: upstream.status });
    }

    const data = await upstream.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
