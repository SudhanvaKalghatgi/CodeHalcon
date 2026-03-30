import { describe, it, expect } from "vitest"
import { shouldIgnoreFile } from "../modules/diff/diff.filter.js"

describe("shouldIgnoreFile", () => {
  it("ignores lock files", () => {
    expect(shouldIgnoreFile("package-lock.json")).toBe(true)
    expect(shouldIgnoreFile("yarn.lock")).toBe(true)
    expect(shouldIgnoreFile("pnpm-lock.yaml")).toBe(true)
  })

  it("ignores binary files", () => {
    expect(shouldIgnoreFile("image.png")).toBe(true)
    expect(shouldIgnoreFile("font.woff2")).toBe(true)
    expect(shouldIgnoreFile("video.mp4")).toBe(true)
  })

  it("ignores build directories", () => {
    expect(shouldIgnoreFile("dist/index.js")).toBe(true)
    expect(shouldIgnoreFile("build/main.js")).toBe(true)
    expect(shouldIgnoreFile(".next/server/app.js")).toBe(true)
  })

  it("ignores minified files", () => {
    expect(shouldIgnoreFile("app.min.js")).toBe(true)
  })

  it("does not ignore regular source files", () => {
    expect(shouldIgnoreFile("src/index.js")).toBe(false)
    expect(shouldIgnoreFile("src/auth/login.js")).toBe(false)
    expect(shouldIgnoreFile("README.md")).toBe(false)
  })
})