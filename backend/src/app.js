import Fastify from "fastify"
import cors from "@fastify/cors"
import helmet from "@fastify/helmet"
import rateLimit from "@fastify/rate-limit"
import rawBody from "fastify-raw-body"
import { errorHandler } from "./middleware/errorHandler.js"
import healthRoutes from "./modules/health/health.routes.js"
import webhookRoutes from "./modules/webhook/webhook.routes.js"
import reviewRoutes from "./modules/review/review.routes.js"
import { config } from "./config/env.js"

const buildApp = async () => {
  const app = Fastify({
    logger: {
      level: config.isDev ? "debug" : "info",
      transport: config.isDev
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
    },
  })

  // Raw body for webhook signature verification
  await app.register(rawBody, {
    field: "rawBody",
    global: false,
    encoding: "utf8",
    runFirst: true,
  })

  // Rate limiting
  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: "1 minute",
    errorResponseBuilder: (_request, context) => ({
      statusCode: 429,
      success: false,
      message: `Rate limit exceeded. Try again in ${context.after}.`,
      errors: [],
    }),
  })

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: false,
  })

  // CORS
  await app.register(cors, {
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })

  // Routes
  await app.register(healthRoutes, { prefix: "/api/v1" })
  await app.register(webhookRoutes, { prefix: "/api/v1/webhook" })
  await app.register(reviewRoutes, { prefix: "/api/v1" })

  // Error handler
  app.setErrorHandler(errorHandler)

  return app
}

export default buildApp