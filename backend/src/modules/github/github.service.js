import { App } from "@octokit/app"
import { config } from "../../config/env.js"

const githubApp = new App({
  appId: config.github.appId,
  privateKey: config.github.privateKey,
  webhooks: {
    secret: config.github.webhookSecret,
  },
})

export const getInstallationClient = async (installationId) => {
  const octokit = await githubApp.getInstallationOctokit(installationId)
  return octokit
}

export const postReviewComment = async (installationId, owner, repo, pullNumber, comments) => {
  const octokit = await getInstallationClient(installationId)

  await octokit.request("POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews", {
    owner,
    repo,
    pull_number: pullNumber,
    event: "COMMENT",
    comments,
  })
}

export const postSummaryComment = async (installationId, owner, repo, pullNumber, body) => {
  const octokit = await getInstallationClient(installationId)

  await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
    owner,
    repo,
    issue_number: pullNumber,
    body,
  })
}

export default githubApp