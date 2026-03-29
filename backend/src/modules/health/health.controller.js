import { ApiResponse } from "../../utils/ApiResponse.js"
import { getMetrics } from "../../utils/metrics.js"

export const healthCheck = async (request, reply) => {
  reply.send(new ApiResponse(200, { status: "ok" }, "CodeHalcon API is live"))
}

export const metricsCheck = async (request, reply) => {
  const metrics = getMetrics()
  reply.send(new ApiResponse(200, metrics, "Metrics fetched successfully"))
}