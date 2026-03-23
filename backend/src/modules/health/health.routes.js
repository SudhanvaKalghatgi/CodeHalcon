import { healthCheck } from "./health.controller.js"

export default async function healthRoutes(fastify, _options) {
  fastify.get("/health", healthCheck)
}
