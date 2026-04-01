import dotenv from "dotenv"
import { readFileSync } from "fs"
dotenv.config()

const requiredEnvVars = [
  "PORT",
  "NODE_ENV",
  "GITHUB_APP_ID",
  "GITHUB_WEBHOOK_SECRET",
  "GROQ_API_KEY",
  "GROQ_MODEL",
  "REDIS_URL",
  "DATABASE_URL",
  "API_SECRET_KEY",
]

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})

// Validate API key strength
const apiKey = process.env.API_SECRET_KEY
if (apiKey.length < 32) {
  console.error("API_SECRET_KEY must be at least 32 characters long")
  process.exit(1)
}

/**
 * Load GitHub private key.
 * Supports two modes:
 * - GITHUB_PRIVATE_KEY env var: key contents directly (for Render/Railway/Vercel)
 * - GITHUB_PRIVATE_KEY_PATH env var: path to .pem file (for local dev)
 * GITHUB_PRIVATE_KEY takes precedence if both are set.
 */
const loadPrivateKey = () => {
  if (process.env.GITHUB_PRIVATE_KEY) {
    // Replace literal \n with actual newlines in case the env var was set
    // with escaped newlines (common in CI/CD dashboards)
    return process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n")
  }

  if (process.env.GITHUB_PRIVATE_KEY_PATH) {
    try {
      return readFileSync(process.env.GITHUB_PRIVATE_KEY_PATH, "utf8")
    } catch (err) {
      throw new Error(
        `Failed to read GitHub private key from path "${process.env.GITHUB_PRIVATE_KEY_PATH}": ${err.message}`
      )
    }
  }

  throw new Error(
    "Missing GitHub private key: set either GITHUB_PRIVATE_KEY (key contents) or GITHUB_PRIVATE_KEY_PATH (path to .pem file)"
  )
}

export const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV === "development",
  github: {
    appId: process.env.GITHUB_APP_ID,
    privateKey: loadPrivateKey(),
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  db: {
    url: process.env.DATABASE_URL,
  },
  apiSecretKey: process.env.API_SECRET_KEY,
}