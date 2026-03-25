import crypto from "crypto"
import { ApiResponse } from "../../utils/ApiResponse.js"
import { ApiError } from "../../utils/ApiError.js"
import { config } from "../../config/env.js"
import { orchestrateReview } from "../review/review.service.js"

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
    return reply.send(new ApiResponse(200, null, "Event ignored"))
  }

  if (!payload || !payload.pull_request || !payload.repository || !payload.installation) {
    throw new ApiError(400, "Invalid webhook payload — missing required fields")
  }

  const action = payload.action
  const relevantActions = ["opened", "synchronize", "reopened"]

  if (!relevantActions.includes(action)) {
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

  request.log.info({ pullNumber, owner, repo, action, sha }, "PR event received")

  orchestrateReview({ installationId, owner, repo, pullNumber, sha }).catch((err) => {
    request.log.error({ err, pullNumber, owner, repo }, "Review orchestration failed")
  })

  return reply.send(
    new ApiResponse(200, { pullNumber, owner, repo, action }, "PR review started")
  )
}