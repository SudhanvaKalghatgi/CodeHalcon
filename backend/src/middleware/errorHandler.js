import { ApiError } from "../utils/ApiError.js"

export const errorHandler = (err, request, reply) => {
  let error = err

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500
    const message = error.message || "Internal Server Error"
    error = new ApiError(statusCode, message, [], err.stack)
  }

  reply.status(error.statusCode).send({
    success: false,
    message: error.message,
    errors: error.errors,
  })
}
