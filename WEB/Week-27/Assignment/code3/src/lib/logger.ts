type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMeta {
  requestId?: string;
  userId?: string;
  path?: string;
  duration?: number;
  status?: number;
  error?: string;
  stack?: string;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, meta: LogMeta = {}): void {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (process.env.NODE_ENV === "production") {
    // JSON output — log aggregators (Datadog, Logtail, AWS CloudWatch) parse this
    if (level === "error") {
      console.error(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  } else {
    // Human-readable in development
    const colours: Record<LogLevel, string> = {
      info: "\x1b[36m",
      warn: "\x1b[33m",
      error: "\x1b[31m",
      debug: "\x1b[90m",
    };
    const reset = "\x1b[0m";
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    console.log(
      `${colours[level]}[${level.toUpperCase()}]${reset} ${message}${metaStr}`,
    );
  }
}

export const logger = {
  info: (msg: string, meta?: LogMeta) => log("info", msg, meta),
  warn: (msg: string, meta?: LogMeta) => log("warn", msg, meta),
  error: (msg: string, meta?: LogMeta) => log("error", msg, meta),
  debug: (msg: string, meta?: LogMeta) => log("debug", msg, meta),
};
