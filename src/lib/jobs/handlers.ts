/**
 * Job handler registry.
 *
 * Each handler is an async function that receives a typed payload
 * and performs the work.  Handlers are registered against the
 * global job queue at import time.
 */

import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { ActivityLogPayload } from "./types";

/** Persist an activity log entry to the database. */
export async function handleActivityLog(payload: ActivityLogPayload): Promise<void> {
  await prisma.activityLog.create({
    data: {
      userId: payload.userId,
      action: payload.action,
      metadata: payload.metadata ? (payload.metadata as Prisma.InputJsonValue) : undefined,
    },
  });
}
