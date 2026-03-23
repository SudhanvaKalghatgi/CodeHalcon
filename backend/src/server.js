// CodeHalcon Backend — Entry Point
import buildApp from "./app.js"
import { config } from "./config/env.js"

const start = async () => {
  const app = await buildApp()

  try {
    await app.listen({ port: config.port, host: "0.0.0.0" })
    console.log(`🦅 CodeHalcon backend running on port ${config.port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()