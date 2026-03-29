import { config } from "../config/env.js"

// Structured logger utility wrapping Fastify's Pino instance
// For use outside of request context (workers, services)
export const createLogger = (context = {}) => {
  const base = {
    timestamp: () => new Date().toISOString(),
    env: config.nodeEnv,
    ...context,
  }

  return {
    info: (data, msg) => {
      if (config.isDev) {
        console.log(JSON.stringify({ level: "info", ...base, ...data, msg }))
      }
    },
    warn: (data, msg) => {
      console.warn(JSON.stringify({ level: "warn", ...base, ...data, msg }))
    },
    error: (data, msg) => {
      console.error(JSON.stringify({ level: "error", ...base, ...data, msg }))
    },
  }
}

export const logger = createLogger()