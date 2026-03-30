import { describe, it, expect } from "vitest"
import { validateConfig } from "../modules/config/config.validator.js"
import { defaultConfig } from "../modules/config/config.defaults.js"

describe("validateConfig", () => {
  it("returns default config for null input", () => {
    expect(validateConfig(null)).toEqual(defaultConfig)
  })

  it("returns default config for invalid input", () => {
    expect(validateConfig("invalid")).toEqual(defaultConfig)
    expect(validateConfig(123)).toEqual(defaultConfig)
  })

  it("validates min_severity correctly", () => {
    const config = validateConfig({ review: { min_severity: "critical" } })
    expect(config.review.min_severity).toBe("critical")
  })

  it("ignores invalid min_severity", () => {
    const config = validateConfig({ review: { min_severity: "invalid" } })
    expect(config.review.min_severity).toBe(defaultConfig.review.min_severity)
  })

  it("validates focus array", () => {
    const config = validateConfig({ review: { focus: ["security", "bugs"] } })
    expect(config.review.focus).toEqual(["security", "bugs"])
  })

  it("keeps default focus when all focus items are invalid", () => {
    const config = validateConfig({ review: { focus: ["invalid", "also_invalid"] } })
    expect(config.review.focus).toEqual(defaultConfig.review.focus)
  })

  it("clamps max_files between 1 and 50", () => {
    expect(validateConfig({ review: { max_files: 0 } }).review.max_files).toBe(1)
    expect(validateConfig({ review: { max_files: 100 } }).review.max_files).toBe(50)
    expect(validateConfig({ review: { max_files: 10 } }).review.max_files).toBe(10)
  })

  it("truncates custom_instructions to 500 chars", () => {
    const long = "a".repeat(600)
    const config = validateConfig({ review: { custom_instructions: long } })
    expect(config.review.custom_instructions.length).toBe(500)
  })
})