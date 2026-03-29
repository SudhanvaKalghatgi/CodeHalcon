import crypto from "crypto"
import { ApiResponse } from "../../utils/ApiResponse.js"
import { ApiError } from "../../utils/ApiError.js"
import { config } from "../../config/env.js"
import { orchestrateReview } from "../review/review.service.js"
import {
  recordReviewStarted,
  recordReviewCompleted,
  recordReviewFailed,
  recordReviewSkipped,
  recordWebhookIgnored,
} from "../../utils/metrics.js"

const verifyWebhookSignature = (rawBody, signature) => {
  if (!signature) return false

  const hmac = crypto.createHmac("sha256", config.github.webhookSecret)
  hmac.update(rawBody)
  const digest = `sha256=${hmac.digest("hex")}`

  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(signature)
    )
  } catch {
    return false
  }
}

const runReviewWithRetry = async (params, log, attempt = 1) => {
  const MAX_ATTEMPTS = 3
  const { owner, repo, pullNumber } = params

  // Record start once before retry loop
  const startTime = attempt === 1 ? recordReviewStarted() : null

  try {
    log.info({ attempt, pullNumber, owner, repo }, "Review attempt started")
    const result = await orchestrateReview(params)

    if (result.skipped) {
      recordReviewSkipped()
    } else {
      recordReviewCompleted(startTime || Date.now())
    }

    log.info({ pullNumber, owner, repo, result }, "Review completed successfully")
  } catch (err) {
    log.error({ err, attempt, pullNumber, owner, repo }, "Review attempt failed")

    if (attempt < MAX_ATTEMPTS) {
      const delay = attempt * 5000
      log.info({ delay, pullNumber }, `Retrying review in ${delay}ms`)
      setTimeout(() => runReviewWithRetry(params, log, attempt + 1), delay)
    } else {
      recordReviewFailed()
      log.error(
        { pullNumber, owner, repo },
        `Review permanently failed after ${MAX_ATTEMPTS} attempts`
      )
    }
  }
}

export const handleWebhook = async (request, reply) => {
  const signature = request.headers["x-hub-signature-256"]
  const rawBody = request.rawBody

  if (!verifyWebhookSignature(rawBody, signature)) {
    request.log.warn("Webhook signature verification failed")
    throw new ApiError(401, "Invalid webhook signature")
  }

  const event = request.headers["x-github-event"]
  const payload = request.body

  request.log.info({ event }, "Webhook received")

  if (event === "ping") {
    return reply.send(new ApiResponse(200, null, "pong"))
  }

  if (event !== "pull_request") {
    recordWebhookIgnored()
    return reply.send(new ApiResponse(200, null, "Event ignored"))
  }

  if (!payload || !payload.pull_request || !payload.repository || !payload.installation) {
    throw new ApiError(400, "Invalid webhook payload — missing required fields")
  }

  const action = payload.action
  const relevantActions = ["opened", "synchronize", "reopened"]

  if (!relevantActions.includes(action)) {
    recordWebhookIgnored()
    return reply.send(new ApiResponse(200, null, "Action ignored"))
  }

  const pullNumber = payload.pull_request.number
  const sha = payload.pull_request.head?.sha

  if (!pullNumber || !sha) {
    throw new ApiError(400, "Invalid pull request payload — missing PR number or SHA")
  }

  const repoFullName = payload.repository.full_name
  const [owner, repo] = repoFullName.split("/")
  const installationId = payload.installation.id

  request.log.info({ pullNumber, owner, repo, action, sha }, "PR review started")

  setImmediate(() => {
    runReviewWithRetry(
      { installationId, owner, repo, pullNumber, sha },
      request.log
    )
  })

  return reply.send(
    new ApiResponse(200, { pullNumber, owner, repo, action }, "PR review started")
  )
}