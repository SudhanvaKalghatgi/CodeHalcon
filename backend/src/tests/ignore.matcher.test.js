import { describe, it, expect } from "vitest"
import { shouldIgnoreByConfig } from "../modules/config/ignore.matcher.js"

describe("shouldIgnoreByConfig", () => {
  it("returns false for empty patterns", () => {
    expect(shouldIgnoreByConfig("src/index.js", [])).toBe(false)
  })

  it("matches exact filenames", () => {
    expect(shouldIgnoreByConfig("src/index.js", ["**/index.js"])).toBe(true)
  })

  it("matches root level files with **/ prefix", () => {
    expect(shouldIgnoreByConfig("index.js", ["**/index.js"])).toBe(true)
  })

  it("matches by extension glob", () => {
    expect(shouldIgnoreByConfig("src/auth.test.js", ["**/*.test.js"])).toBe(true)
    expect(shouldIgnoreByConfig("src/auth.spec.js", ["**/*.spec.js"])).toBe(true)
  })

  it("matches root level test files", () => {
    expect(shouldIgnoreByConfig("auth.test.js", ["**/*.test.js"])).toBe(true)
  })

  it("does not match non-matching files", () => {
    expect(shouldIgnoreByConfig("src/auth.js", ["**/*.test.js"])).toBe(false)
  })

  it("matches bare filename patterns in any directory", () => {
    expect(shouldIgnoreByConfig("src/package-lock.json", ["package-lock.json"])).toBe(true)
  })

  it("matches bare filename at root level", () => {
    expect(shouldIgnoreByConfig("package-lock.json", ["package-lock.json"])).toBe(true)
  })

  it("matches directory patterns", () => {
    expect(shouldIgnoreByConfig("migrations/001_initial.sql", ["migrations/**"])).toBe(true)
  })
})