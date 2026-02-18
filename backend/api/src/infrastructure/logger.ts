const log = (level: string) => (msg: string, meta?: Record<string, unknown>) => {
  const line = meta ? `${msg} ${JSON.stringify(meta)}` : msg;
  // eslint-disable-next-line no-console
  console[level === "error" ? "error" : "log"](`[${level}] ${line}`);
};

export const logger = {
  info: log("info"),
  warn: log("warn"),
  error: log("error"),
  debug: log("debug"),
};
