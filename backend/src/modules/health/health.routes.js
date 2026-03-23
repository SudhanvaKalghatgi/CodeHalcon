import { healthCheck } from "./health.controller.js"

export default async function healthRoutes(fastify, options) {
  fastify.get("/health", healthCheck)
}