import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import sql from "./index.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

const runMigrations = async () => {
  try {
    console.log("Running migrations...")

    const migration = readFileSync(
      join(__dirname, "migrations/001_initial.sql"),
      "utf8"
    )

    await sql.unsafe(migration)
    console.log("✅ Migrations completed successfully")
  } catch (err) {
    console.error("❌ Migration failed:", err.message)
    process.exit(1)
  } finally {
    await sql.end()
    process.exit(0)
  }
}

runMigrations()