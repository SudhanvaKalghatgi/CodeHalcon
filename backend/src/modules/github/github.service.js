import { App } from "@octokit/app"
import { config } from "../../config/env.js"

// Initialize GitHub App
const githubApp = new App({
  appId: config.github.appId,
  privateKey: config.github.privateKey,
  webhooks: {
    secret: config.github.webhookSecret,
  },
})

// Get an installation-level Octokit client for a specific installation
export const getInstallationClient = async (installationId) => {
  const octokit = await githubApp.getInstallationOctokit(installationId)
  return octokit
}

// Get PR diff
export const getPullRequestDiff = async (installationId, owner, repo, pullNumber) => {
  const octokit = await getInstallationClient(installationId)

  const { data } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
    mediaType: {
      format: "diff",
    },
  })

  return data
}

// Post a review comment on a PR
export const postReviewComment = async (installationId, owner, repo, pullNumber, comments) => {
  const octokit = await getInstallationClient(installationId)

  await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number: pullNumber,
    event: "COMMENT",
    comments,
  })
}

// Post a summary comment on a PR
export const postSummaryComment = async (installationId, owner, repo, pullNumber, body) => {
  const octokit = await getInstallationClient(installationId)

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: pullNumber,
    body,
  })
}

export default githubApp