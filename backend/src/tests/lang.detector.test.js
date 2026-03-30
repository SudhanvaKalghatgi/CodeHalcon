import { describe, it, expect } from "vitest"
import { detectLanguage } from "../modules/diff/lang.detector.js"

describe("detectLanguage", () => {
  it("detects JavaScript files", () => {
    expect(detectLanguage("src/index.js")).toBe("javascript")
    expect(detectLanguage("app.mjs")).toBe("javascript")
    expect(detectLanguage("component.jsx")).toBe("javascript")
  })

  it("detects TypeScript files", () => {
    expect(detectLanguage("src/index.ts")).toBe("typescript")
    expect(detectLanguage("component.tsx")).toBe("typescript")
  })

  it("detects Python files", () => {
    expect(detectLanguage("main.py")).toBe("python")
  })

  it("detects config files", () => {
    expect(detectLanguage("config.json")).toBe("json")
    expect(detectLanguage("docker-compose.yml")).toBe("yaml")
    expect(detectLanguage("config.yaml")).toBe("yaml")
  })

  it("returns plaintext for unknown extensions", () => {
    expect(detectLanguage("file.xyz")).toBe("plaintext")
    expect(detectLanguage("Makefile")).toBe("plaintext")
  })
})