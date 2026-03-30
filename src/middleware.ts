import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";

/**
 * Attaches a request ID and response timing headers to every request.
 *
 * - `x-request-id`: Unique identifier for correlating logs across a request.
 * - `x-response-time`: Wall-clock time spent processing the request (ms).
 */
export function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const start = Date.now();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("x-request-id", requestId);
  response.headers.set("x-response-time", `${Date.now() - start}ms`);

  return response;
}

export const config = {
  // Run on all routes except static assets and Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
