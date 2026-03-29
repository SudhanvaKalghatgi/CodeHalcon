import { ApiResponse } from "../../utils/ApiResponse.js"
import { ApiError } from "../../utils/ApiError.js"
import {
  getAllReviews,
  getReviewsByRepo,
  getReviewStats,
} from "../../db/queries/reviews.js"
import { getAllRepositories, getRepositoryByOwnerRepo } from "../../db/queries/repositories.js"

export const getRepositories = async (request, reply) => {
  const repositories = await getAllRepositories()
  reply.send(new ApiResponse(200, repositories, "Repositories fetched successfully"))
}

export const getReviews = async (request, reply) => {
  const { limit } = request.query
  const reviews = await getAllReviews(limit ? parseInt(limit, 10) : 50)
  reply.send(new ApiResponse(200, reviews, "Reviews fetched successfully"))
}

export const getRepoReviews = async (request, reply) => {
  const { owner, repo } = request.params
  const { limit } = request.query

  const repository = await getRepositoryByOwnerRepo(owner, repo)
  if (!repository) {
    throw new ApiError(404, `Repository ${owner}/${repo} not found`)
  }

  const reviews = await getReviewsByRepo(owner, repo, limit ? parseInt(limit, 10) : 20)
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
  const repositories = await getAllRepositories()
  const reviews = await getAllReviews(100)

  const totalReviews = reviews.length
  const totalIssues = reviews.reduce((acc, r) => acc + (parseInt(r.total_issues) || 0), 0)
  const totalCritical = reviews.reduce((acc, r) => acc + (parseInt(r.critical_count) || 0), 0)
  const totalWarnings = reviews.reduce((acc, r) => acc + (parseInt(r.warning_count) || 0), 0)
  const totalSuggestions = reviews.reduce((acc, r) => acc + (parseInt(r.suggestion_count) || 0), 0)

  reply.send(
    new ApiResponse(
      200,
      {
        totalRepositories: repositories.length,
        totalReviews,
        totalIssues,
        totalCritical,
        totalWarnings,
        totalSuggestions,
        recentReviews: reviews.slice(0, 10),
      },
      "Dashboard stats fetched successfully"
    )
  )
}