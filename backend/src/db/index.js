import postgres from "postgres"
import { config } from "../config/env.js"

const sql = postgres(config.db.url, {
  ssl: "require",
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

export default sql