/**
 * Lightweight in-process job queue.
 *
 * Processes jobs with configurable concurrency, retry logic, and
 * error callbacks.  Designed as a stepping stone — swap to BullMQ
 * or a Redis-backed queue when the app moves to multi-instance.
 */

import { randomUUID } from "node:crypto";
import type { Job, JobType, JobMap } from "./types";

type JobHandler<T extends JobType> = (payload: JobMap[T]) => Promise<void>;

interface QueueOptions {
  concurrency: number;
  onError?: (job: Job, error: unknown) => void;
}

const DEFAULT_OPTIONS: QueueOptions = {
  concurrency: 2,
  onError: (_job, error) => {
    console.error("[JobQueue] Job failed:", error);
  },
};

export class JobQueue {
  private readonly handlers = new Map<string, JobHandler<JobType>>();
  private readonly pending: Job[] = [];
  private activeCount = 0;
  private readonly options: QueueOptions;

  constructor(options: Partial<QueueOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /** Register a handler for a specific job type. */
  register<T extends JobType>(type: T, handler: JobHandler<T>): void {
    this.handlers.set(type, handler as JobHandler<JobType>);
  }

  /** Enqueue a job for background processing. */
  enqueue<T extends JobType>(
    type: T,
    payload: JobMap[T],
    maxRetries = 3
  ): string {
    const id = randomUUID();
    const job: Job<T> = {
      id,
      type,
      payload,
      retries: 0,
      maxRetries,
      createdAt: Date.now(),
    };

    this.pending.push(job as Job);
    this.process();
    return id;
  }

  /** Drain the queue, processing jobs up to concurrency limit. */
  private process(): void {
    while (
      this.activeCount < this.options.concurrency &&
      this.pending.length > 0
    ) {
      const job = this.pending.shift();
      if (!job) break;

      this.activeCount += 1;
      this.execute(job)
        .catch(() => {
          // Errors are handled inside execute's retry logic.
        })
        .finally(() => {
          this.activeCount -= 1;
          this.process();
        });
    }
  }

  private async execute(job: Job): Promise<void> {
    const handler = this.handlers.get(job.type);
    if (!handler) {
      console.warn(`[JobQueue] No handler registered for job type: ${job.type}`);
      return;
    }

    try {
      await handler(job.payload);
    } catch (error) {
      job.retries += 1;

      if (job.retries < job.maxRetries) {
        // Re-queue with exponential backoff
        const delay = Math.min(1000 * 2 ** job.retries, 30_000);
        setTimeout(() => {
          this.pending.push(job);
          this.process();
        }, delay);
      } else {
        this.options.onError?.(job, error);
      }
    }
  }
}
