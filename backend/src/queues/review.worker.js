import { Worker } from "bullmq"
import { createConnection } from "./connection.js"
import { orchestrateReview } from "../modules/review/review.service.js"

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
    concurrency: 1,
  })

  worker.on("completed", (job) => {
    console.log(`✅ Review job ${job.id} completed for ${job.data.owner}/${job.data.repo}#${job.data.pullNumber}`)
  })

  worker.on("failed", (job, err) => {
    if (job) {
      console.error(`❌ Review job ${job.id} failed for ${job.data.owner}/${job.data.repo}#${job.data.pullNumber}:`, err.message)
    } else {
      console.error("❌ Review job failed (job data unavailable):", err.message)
    }
  })

  worker.on("error", (err) => {
    console.error("Worker error:", err.message)
  })

  console.log("🔄 Review worker started")

  return worker
}