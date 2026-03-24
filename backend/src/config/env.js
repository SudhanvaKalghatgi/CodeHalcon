import dotenv from "dotenv"
import { readFileSync } from "fs"
dotenv.config()

const requiredEnvVars = [
  "PORT",
  "NODE_ENV",
  "GITHUB_APP_ID",
  "GITHUB_PRIVATE_KEY_PATH",
  "GITHUB_WEBHOOK_SECRET",
  "GROQ_API_KEY",
  "GROQ_MODEL",
]

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})

const loadPrivateKey = () => {
  try {
    return readFileSync(process.env.GITHUB_PRIVATE_KEY_PATH, "utf8")
  } catch (err) {
    throw new Error(
      `Failed to read GitHub private key from path "${process.env.GITHUB_PRIVATE_KEY_PATH}": ${err.message}`
    )
  }
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
}