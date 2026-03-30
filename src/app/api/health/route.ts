import { NextResponse } from "next/server";

const startTime = Date.now();

/**
 * Health check endpoint for load balancers and monitoring.
 *
 * Returns 200 with basic server status. Does NOT check database
 * connectivity — use a separate /api/health/db endpoint for deep
 * health checks if needed.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.round((Date.now() - startTime) / 1000),
  });
}
