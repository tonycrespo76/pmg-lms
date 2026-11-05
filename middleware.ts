import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("pmg_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.kind === "session") return NextResponse.next();
  } catch {
    // Invalid or expired sessions are treated as signed out.
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/", "/modules/:path*", "/admin/:path*", "/profile"],
};
