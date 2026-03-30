import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const start = Date.now();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const session = await auth();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session?.user && session.user.isActive === false) {
    return NextResponse.redirect(new URL("/login?disabled=1", request.url));
  }

  if (pathname.startsWith("/admin")) {
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if ((pathname === "/login" || pathname === "/signup") && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("x-request-id", requestId);
  response.headers.set("x-response-time", `${Date.now() - start}ms`);

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
