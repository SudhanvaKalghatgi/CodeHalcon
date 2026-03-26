import IORedis from "ioredis"
import { config } from "../config/env.js"

export const createConnection = () =>
  new IORedis(config.redis.url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: false,
    keepAlive: 5000,
    connectTimeout: 20000,
    commandTimeout: 10000,
    retryStrategy: (times) => Math.min(times * 200, 2000),
    reconnectOnError: () => true,
  })