// In-memory metrics store
// Will be replaced with proper observability tool post-deployment

const metrics = {
  reviews: {
    total: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
  },
  tokens: {
    totalUsed: 0,
    totalRequests: 0,
  },
  latency: {
    reviews: [],
  },
  webhooks: {
    received: 0,
    ignored: 0,
    failed: 0,
  },
}

export const recordReviewStarted = () => {
  metrics.reviews.total++
  metrics.webhooks.received++
  return Date.now()
}

export const recordReviewCompleted = (startTime, tokenCount = 0) => {
  metrics.reviews.successful++
  const latency = Date.now() - startTime

  // Keep last 100 latencies
  metrics.latency.reviews.push(latency)
  if (metrics.latency.reviews.length > 100) {
    metrics.latency.reviews.shift()
  }

  metrics.tokens.totalUsed += tokenCount
  metrics.tokens.totalRequests++
}

export const recordReviewFailed = () => {
  metrics.reviews.failed++
}

export const recordReviewSkipped = () => {
  metrics.reviews.skipped++
}

export const recordWebhookIgnored = () => {
  metrics.webhooks.ignored++
}

export const getMetrics = () => {
  const latencies = metrics.latency.reviews
  const avgLatency = latencies.length
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : 0

  const p95Latency = latencies.length
    ? latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)]
    : 0

  return {
    reviews: { ...metrics.reviews },
    tokens: { ...metrics.tokens },
    latency: {
      avgMs: avgLatency,
      p95Ms: p95Latency,
      samples: latencies.length,
    },
    webhooks: { ...metrics.webhooks },
  }
}

export const resetMetrics = () => {
  metrics.reviews = { total: 0, successful: 0, failed: 0, skipped: 0 }
  metrics.tokens = { totalUsed: 0, totalRequests: 0 }
  metrics.latency.reviews = []
  metrics.webhooks = { received: 0, ignored: 0, failed: 0 }
}