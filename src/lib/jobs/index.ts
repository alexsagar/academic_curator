/**
 * Background job system entry point.
 *
 * Provides an `enqueue()` function that adds jobs to the
 * in-process queue.  The queue is initialized as a globalThis
 * singleton to survive HMR in development.
 */

import { JobQueue } from "./queue";
import { handleActivityLog } from "./handlers";
import type { JobType, JobMap } from "./types";

const globalForJobs = globalThis as unknown as {
  jobQueue: JobQueue | undefined;
};

function getQueue(): JobQueue {
  if (!globalForJobs.jobQueue) {
    const queue = new JobQueue({ concurrency: 3 });
    queue.register("activity:log", handleActivityLog);
    globalForJobs.jobQueue = queue;
  }

  return globalForJobs.jobQueue;
}

/**
 * Enqueue a background job.
 *
 * The job will be processed asynchronously — the caller does not
 * need to await the result.
 */
export function enqueue<T extends JobType>(
  type: T,
  payload: JobMap[T],
  maxRetries?: number
): string {
  return getQueue().enqueue(type, payload, maxRetries);
}

export type { JobType, JobMap } from "./types";
