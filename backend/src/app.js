import Fastify from "fastify"
import cors from "@fastify/cors"
import helmet from "@fastify/helmet"
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

  await app.register(rawBody, {
    field: "rawBody",
    global: false,
    encoding: "utf8",
    runFirst: true,
  })

  await app.register(cors, {
    origin: config.isDev ? "*" : process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })

  await app.register(helmet)

  // routes
  await app.register(healthRoutes, { prefix: "/api/v1" })
  await app.register(webhookRoutes, { prefix: "/api/v1/webhook" })
  await app.register(reviewRoutes, { prefix: "/api/v1" })

  app.setErrorHandler(errorHandler)

  return app
}

export default buildApp