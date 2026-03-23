import { ApiResponse } from "../../utils/ApiResponse.js"
import { ApiError } from "../../utils/ApiError.js"

export const handleWebhook = async (request, reply) => {
  const event = request.headers["x-github-event"]
  const payload = request.body

  request.log.info({ event }, "Webhook received")

  if (event === "ping") {
    return reply.send(new ApiResponse(200, null, "pong"))
  }

  if (event !== "pull_request") {
    return reply.send(new ApiResponse(200, null, "Event ignored"))
  }

  const action = payload.action

  // Only process these PR actions
  const relevantActions = ["opened", "synchronize", "reopened"]

  if (!relevantActions.includes(action)) {
    return reply.send(new ApiResponse(200, null, "Action ignored"))
  }

  const {
    number: pullNumber,
    head: { sha },
    title,
  } = payload.pull_request

  const { full_name: repoFullName } = payload.repository
  const [owner, repo] = repoFullName.split("/")
  const installationId = payload.installation.id

  request.log.info(
    { pullNumber, owner, repo, action, sha },
    "PR event queued for review"
  )

  // TODO: Queue the review job (Phase 4)
  // For now just acknowledge
  return reply.send(
    new ApiResponse(200, { pullNumber, owner, repo, action }, "PR queued for review")
  )
}