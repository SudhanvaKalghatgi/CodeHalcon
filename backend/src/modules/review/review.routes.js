import {
  getRepositories,
  getReviews,
  getRepoReviews,
  getRepoStats,
  getDashboardStats,
} from "./review.controller.js"
import { apiAuth } from "../../middleware/apiAuth.js"

export default async function reviewRoutes(fastify, _options) {
  fastify.addHook("preHandler", apiAuth)

  // Dashboard stats
  fastify.get("/dashboard", {
    config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    handler: getDashboardStats,
  })

  // All repositories
  fastify.get("/repositories", {
    config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    handler: getRepositories,
  })

  // All reviews
  fastify.get("/reviews", {
    config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    handler: getReviews,
  })

  // Reviews for a specific repo
  fastify.get("/repos/:owner/:repo/reviews", {
    config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    handler: getRepoReviews,
  })

  // Stats for a specific repo
  fastify.get("/repos/:owner/:repo/stats", {
    config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    handler: getRepoStats,
  })
}