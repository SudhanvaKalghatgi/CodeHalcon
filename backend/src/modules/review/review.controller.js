import { ApiResponse } from "../../utils/ApiResponse.js"
import { ApiError } from "../../utils/ApiError.js"
import {
  getAllReviews,
  getReviewsByRepo,
  getReviewStats,
  getGlobalStats,
} from "../../db/queries/reviews.js"
import { getAllRepositories, getRepositoryByOwnerRepo } from "../../db/queries/repositories.js"

const parseLimit = (value, defaultVal = 50, min = 1, max = 100) => {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return defaultVal
  return Math.min(Math.max(parsed, min), max)
}

export const getRepositories = async (request, reply) => {
  const repositories = await getAllRepositories()
  reply.send(new ApiResponse(200, repositories, "Repositories fetched successfully"))
}

export const getReviews = async (request, reply) => {
  const limit = parseLimit(request.query.limit)
  const reviews = await getAllReviews(limit)
  reply.send(new ApiResponse(200, reviews, "Reviews fetched successfully"))
}

export const getRepoReviews = async (request, reply) => {
  const { owner, repo } = request.params
  const limit = parseLimit(request.query.limit, 20)

  const repository = await getRepositoryByOwnerRepo(owner, repo)
  if (!repository) {
    throw new ApiError(404, `Repository ${owner}/${repo} not found`)
  }

  const reviews = await getReviewsByRepo(owner, repo, limit)
  reply.send(new ApiResponse(200, reviews, "Repo reviews fetched successfully"))
}

export const getRepoStats = async (request, reply) => {
  const { owner, repo } = request.params

  const repository = await getRepositoryByOwnerRepo(owner, repo)
  if (!repository) {
    throw new ApiError(404, `Repository ${owner}/${repo} not found`)
  }

  const stats = await getReviewStats(owner, repo)
  reply.send(new ApiResponse(200, stats, "Repo stats fetched successfully"))
}

export const getDashboardStats = async (request, reply) => {
  const [globalStats, recentReviews] = await Promise.all([
    getGlobalStats(),
    getAllReviews(10),
  ])

  reply.send(
    new ApiResponse(
      200,
      {
        totalRepositories: parseInt(globalStats.total_repositories) || 0,
        totalReviews: parseInt(globalStats.total_reviews) || 0,
        totalIssues: parseInt(globalStats.total_issues) || 0,
        totalCritical: parseInt(globalStats.total_critical) || 0,
        totalWarnings: parseInt(globalStats.total_warnings) || 0,
        totalSuggestions: parseInt(globalStats.total_suggestions) || 0,
        recentReviews,
      },
      "Dashboard stats fetched successfully"
    )
  )
}