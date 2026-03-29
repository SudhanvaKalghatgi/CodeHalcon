import {
  getRepositories,
  getReviews,
  getRepoReviews,
  getRepoStats,
  getDashboardStats,
} from "./review.controller.js"
import { apiAuth } from "../../middleware/apiAuth.js"

export default async function reviewRoutes(fastify, _options) {
  // All routes require API key auth
  fastify.addHook("preHandler", apiAuth)

  // Dashboard stats
  fastify.get("/dashboard", getDashboardStats)

  // All repositories
  fastify.get("/repositories", getRepositories)

  // All reviews
  fastify.get("/reviews", getReviews)

  // Reviews for a specific repo
  fastify.get("/repos/:owner/:repo/reviews", getRepoReviews)

  // Stats for a specific repo
  fastify.get("/repos/:owner/:repo/stats", getRepoStats)
}