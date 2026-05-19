/**
 * @puff/logger
 *
 * Shared structured logger for Puff. Built on Pino.
 *
 * Why Pino:
 * - Fastest JSON logger in Node.js (benchmark-leading)
 * - Edge-runtime compatible via browser config
 * - Active maintenance, used in production by many teams
 *
 * Why a shared package:
 * - One log format across all Puff services (web, future Python sidecar, workers)
 * - Sensitive field redaction defined once, applied everywhere
 * - Centralized control over log levels and transports
 *
 * Usage:
 *   import { createLogger } from "@puff/logger";
 *   const log = createLogger("web-api");
 *   log.info({ userId: 123 }, "user logged in");
 *   log.error({ err }, "failed to send email");
 *
 * Conventions for log calls:
 * - First argument is an object of structured fields (NOT a string)
 * - Second argument is a human-readable message
 * - Use error objects in an "err" field: log.error({ err }, "failed")
 * - Never log secrets, passwords, or raw tokens (auto-redacted but be careful)
 */

import pino, { type Logger as PinoLogger, type LoggerOptions } from "pino";

/**
 * Exported logger type. Use this when passing loggers as function arguments
 * or storing them on request contexts.
 */
export type Logger = PinoLogger;

/**
 * Log levels in increasing severity.
 * Configured via LOG_LEVEL env var (e.g. LOG_LEVEL=debug pnpm dev).
 */
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal" | "silent";

/**
 * Resolve the default log level based on environment.
 * - Production defaults to "info" (cuts noise)
 * - Development defaults to "debug" (see everything while building)
 * - Test defaults to "silent" (clean test output)
 * Override with LOG_LEVEL env var.
 */
function resolveLogLevel(): LogLevel {
  const explicit = process.env.LOG_LEVEL as LogLevel | undefined;
  if (explicit) return explicit;

  const env = process.env.NODE_ENV;
  if (env === "test") return "silent";
  if (env === "production") return "info";
  return "debug";
}

/**
 * Determine whether to enable pino-pretty for human-readable output.
 * - Dev: pretty (easier to read)
 * - Prod: JSON (machine-parseable, ready for log aggregators)
 * - Test: silent anyway
 *
 * We also disable pretty in CI to keep CI logs in JSON form (easier
 * to grep, consistent with production behavior).
 */
function shouldUsePretty(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.CI === "true") return false;
  return true;
}

/**
 * Paths to redact from log output. Pino replaces matched paths with
 * "[REDACTED]" before emitting.
 *
 * This is a security primitive. Even if developer accidentally logs
 * an entire request object, sensitive fields stay out of the logs.
 *
 * Patterns:
 * - Direct fields: "password", "token", "apiKey", "secret"
 * - Header conventions: "*.authorization", "headers.authorization"
 * - Common request body fields
 *
 * If you need to add a redaction path, add it here, not in individual
 * log calls. Single source of truth.
 */
const REDACT_PATHS = [
  // Direct fields anywhere in the log object
  "password",
  "token",
  "apiKey",
  "api_key",
  "secret",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",

  // Nested under common request shapes
  "*.password",
  "*.token",
  "*.apiKey",
  "*.secret",
  "req.headers.authorization",
  "req.headers.cookie",
  "headers.authorization",
  "headers.cookie",
];

/**
 * Build the Pino options object for a given logger name.
 *
 * Why this is a function (not a constant):
 * - Environment variables can change between test runs
 * - Different loggers may want different options later
 * - Allows per-call override if needed
 */
function buildOptions(name: string): LoggerOptions {
  const options: LoggerOptions = {
    name,
    level: resolveLogLevel(),
    // Add ISO timestamps. Pino's default is unix ms; ISO is more readable
    // and standard for log aggregators.
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: REDACT_PATHS,
      censor: "[REDACTED]",
    },
    // Format error objects properly — include stack, message, name.
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
    },
  };

  if (shouldUsePretty()) {
    options.transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss.l",
        ignore: "pid,hostname",
        messageFormat: "{name} | {msg}",
      },
    };
  }

  return options;
}

/**
 * Create a named logger. The name appears in every log line, making it
 * trivial to filter logs by service when running multiple services.
 *
 * Usage:
 *   const log = createLogger("web-api");
 *   log.info("server started");
 *
 *   // Pass to functions that need to log:
 *   async function handler(req: Request, log: Logger) {
 *     log.debug({ url: req.url }, "received request");
 *   }
 *
 * @param name - Service or module identifier (e.g. "web-api", "ingestion-worker")
 * @returns A configured Pino logger instance
 */
export function createLogger(name: string): Logger {
  return pino(buildOptions(name));
}

/**
 * Create a child logger with bound context fields.
 *
 * Useful when you want all logs from a specific request, user, or
 * operation to automatically include common fields without repeating them.
 *
 * Usage:
 *   const log = createLogger("web-api");
 *   const requestLog = withContext(log, { requestId: "req_abc123", userId: 42 });
 *   requestLog.info("processing"); // automatically includes requestId and userId
 *
 * @param logger - Parent logger to extend
 * @param context - Fields to bind to all subsequent log calls from this child
 * @returns A child logger with bound fields
 */
export function withContext(logger: Logger, context: Record<string, unknown>): Logger {
  return logger.child(context);
}
