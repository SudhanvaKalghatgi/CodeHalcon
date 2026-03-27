import sql from "../index.js"

export const upsertRepository = async (installationId, owner, repo) => {
  const [repository] = await sql`
    INSERT INTO repositories (installation_id, owner, repo, updated_at)
    VALUES (${installationId}, ${owner}, ${repo}, NOW())
    ON CONFLICT (owner, repo)
    DO UPDATE SET
      installation_id = EXCLUDED.installation_id,
      updated_at = NOW()
    RETURNING *
  `
  return repository
}

export const getRepositoryByOwnerRepo = async (owner, repo) => {
  const [repository] = await sql`
    SELECT * FROM repositories
    WHERE owner = ${owner} AND repo = ${repo}
  `
  return repository || null
}

export const getAllRepositories = async () => {
  const repositories = await sql`
    SELECT * FROM repositories
    ORDER BY updated_at DESC
  `
  return repositories
}