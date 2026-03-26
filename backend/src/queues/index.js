import { Queue } from "bullmq"
import { createConnection } from "./connection.js"

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