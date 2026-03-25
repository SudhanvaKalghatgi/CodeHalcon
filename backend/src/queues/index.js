import { Queue } from "bullmq"
import IORedis from "ioredis"
import { config } from "../config/env.js"

const createConnection = () =>
  new IORedis(config.redis.url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: false,
    keepAlive: 5000,
    connectTimeout: 20000,
    commandTimeout: 10000,
    retryStrategy: (times) => {
      if (times > 10) return null
      return Math.min(times * 200, 2000)
    },
    reconnectOnError: () => true,
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