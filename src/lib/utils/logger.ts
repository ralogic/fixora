type Level = "info" | "warn" | "error";

type LogPayload = {
  message: string;
  context?: Record<string, unknown>;
};

function log(level: Level, payload: LogPayload) {
  const data = {
    level,
    timestamp: new Date().toISOString(),
    message: payload.message,
    ...(payload.context ? { context: payload.context } : {}),
  };

  const line = JSON.stringify(data);
  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => log("info", { message, context }),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", { message, context }),
  error: (message: string, context?: Record<string, unknown>) => log("error", { message, context }),
};
