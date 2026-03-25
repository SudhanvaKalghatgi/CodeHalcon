import { Worker } from "bullmq"
import IORedis from "ioredis"
import { config } from "../config/env.js"
import { orchestrateReview } from "../modules/review/review.service.js"

const createConnection = () =>
  new IORedis(config.redis.url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: config.redis.url.startsWith("rediss://") ? {} : undefined,
    keepAlive: 30000,
    connectTimeout: 10000,
    retryStrategy: (times) => Math.min(times * 500, 5000),
  })

const processReviewJob = async (job) => {
  const { installationId, owner, repo, pullNumber, sha } = job.data

  job.log(`Starting review for ${owner}/${repo}#${pullNumber}`)

  const result = await orchestrateReview({
    installationId,
    owner,
    repo,
    pullNumber,
    sha,
  })

  job.log(`Review completed for ${owner}/${repo}#${pullNumber}`)

  return result
}

export const startReviewWorker = () => {
  const worker = new Worker("review", processReviewJob, {
    connection: createConnection(),
    concurrency: 3,
  })

  worker.on("completed", (job) => {
    console.log(`✅ Review job ${job.id} completed for ${job.data.owner}/${job.data.repo}#${job.data.pullNumber}`)
  })

  worker.on("failed", (job, err) => {
    console.error(`❌ Review job ${job.id} failed:`, err.message)
  })

  worker.on("error", (err) => {
    console.error("Worker error:", err.message)
  })

  console.log("🔄 Review worker started")

  return worker
}