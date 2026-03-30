/**
 * Structured application logger.
 *
 * Outputs JSON lines in production and human-readable format in
 * development.  Controlled by the LOG_LEVEL env variable.
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info("User registered", { userId: "abc" });
 *   logger.error("Payment failed", { error: err.message, userId });
 */

import { getOptionalEnv } from "@/lib/env";

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function getMinLevel(): LogLevel {
  const env = getOptionalEnv("LOG_LEVEL") ?? "info";
  return env in LEVEL_PRIORITY ? (env as LogLevel) : "info";
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[getMinLevel()];
}

function formatEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === "production") {
    return JSON.stringify(entry);
  }

  // Human-readable in development
  const { level, message, timestamp, ...rest } = entry;
  const context = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : "";
  return `[${timestamp}] ${level.toUpperCase().padEnd(5)} ${message}${context}`;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  const formatted = formatEntry(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => log("error", message, context),
};
