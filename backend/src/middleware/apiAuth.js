import { ApiError } from "../utils/ApiError.js"
import { config } from "../config/env.js"

export const apiAuth = async (request, _reply) => {
  const authHeader = request.headers["authorization"]

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing or invalid authorization header")
  }

  const token = authHeader.split(" ")[1]

  if (token !== config.apiSecretKey) {
    throw new ApiError(401, "Invalid API key")
  }
}