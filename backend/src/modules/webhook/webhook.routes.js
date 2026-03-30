import { handleWebhook } from "./webhook.controller.js"

export default async function webhookRoutes(fastify, _options) {
  fastify.post("/github", {
    config: {
      rawBody: true,
      rateLimit: {
        max: 50,
        timeWindow: "1 minute",
      },
    },
    handler: handleWebhook,
  })
}