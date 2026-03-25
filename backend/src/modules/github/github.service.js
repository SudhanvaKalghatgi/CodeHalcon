import { App } from "@octokit/app"
import { config } from "../../config/env.js"

let githubApp = null

const getGithubApp = () => {
  if (githubApp) return githubApp

  if (!config.github.appId || !config.github.privateKey || !config.github.webhookSecret) {
    throw new Error("Missing required GitHub App configuration")
  }

  githubApp = new App({
    appId: config.github.appId,
    privateKey: config.github.privateKey,
    webhooks: {
      secret: config.github.webhookSecret,
    },
  })

  return githubApp
}

export const getInstallationClient = async (installationId) => {
  try {
    const app = getGithubApp()
    const octokit = await app.getInstallationOctokit(installationId)
    return octokit
  } catch (err) {
    throw new Error(`Failed to get installation client: ${err.message}`)
  }
}

export const postReviewComment = async (installationId, owner, repo, pullNumber, comments) => {
  try {
    const octokit = await getInstallationClient(installationId)
    await octokit.request("POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews", {
      owner,
      repo,
      pull_number: pullNumber,
      event: "COMMENT",
      comments,
    })
  } catch (err) {
    throw new Error(`Failed to post review comment: ${err.message}`)
  }
}

export const postSummaryComment = async (installationId, owner, repo, pullNumber, body) => {
  try {
    const octokit = await getInstallationClient(installationId)
    await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
      owner,
      repo,
      issue_number: pullNumber,
      body,
    })
  } catch (err) {
    throw new Error(`Failed to post summary comment: ${err.message}`)
  }
}