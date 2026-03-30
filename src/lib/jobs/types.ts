/**
 * Background job type definitions.
 *
 * Each job type has a typed payload. Add new job types here
 * as the application grows.
 */

export interface ActivityLogPayload {
  userId: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export interface EmailSendPayload {
  to: string;
  subject: string;
  html: string;
}

export type JobMap = {
  "activity:log": ActivityLogPayload;
  "email:send": EmailSendPayload;
};

export type JobType = keyof JobMap;

export interface Job<T extends JobType = JobType> {
  id: string;
  type: T;
  payload: JobMap[T];
  retries: number;
  maxRetries: number;
  createdAt: number;
}
