import crypto from "crypto"
import { ApiError } from "../utils/ApiError.js"
import { config } from "../config/env.js"

const constantTimeEquals = (a, b) => {
  try {
    return crypto.timingSafeEqual(
      Buffer.from(a),
      Buffer.from(b)
    )
  } catch {
    return false
  }
}

export const apiAuth = async (request, _reply) => {
  const authHeader = request.headers["authorization"]

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing or invalid authorization header")
  }

  const token = authHeader.split(" ")[1]

  if (!constantTimeEquals(token, config.apiSecretKey)) {
    throw new ApiError(401, "Invalid API key")
  }
}