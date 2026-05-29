import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isInterventionsApi = pathname.startsWith("/api/interventions");
  if (!isInterventionsApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await verifyAuthToken(token);
    if (payload.role !== "mentor" && payload.role !== "admin") {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }
    return NextResponse.next();
  } catch {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/interventions/:path*"],
};
