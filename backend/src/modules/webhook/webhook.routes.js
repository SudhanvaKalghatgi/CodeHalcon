import { handleWebhook } from "./webhook.controller.js"

export default async function webhookRoutes(fastify, _options) {
  fastify.post("/github", {
    config: {
      rawBody: true,
    },
    handler: handleWebhook,
  })
}