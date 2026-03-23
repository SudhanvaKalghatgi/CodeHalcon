// Health check controller
import { ApiResponse } from "../../utils/ApiResponse.js"

export const healthCheck = async (request, reply) => {
  reply.send(new ApiResponse(200, { status: "ok" }, "CodeHalcon API is live"))
}
