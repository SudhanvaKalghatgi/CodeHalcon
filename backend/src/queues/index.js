import { Queue } from "bullmq"
import IORedis from "ioredis"
import { config } from "../config/env.js"

const createConnection = () =>
  new IORedis(config.redis.url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: config.redis.url.startsWith("redis://") ? {} : undefined,
    keepAlive: 30000,
    connectTimeout: 10000,
    retryStrategy: (times) => Math.min(times * 500, 5000),
  })

export const reviewQueue = new Queue("review", {
  connection: createConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
})