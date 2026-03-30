export const defaultConfig = {
  version: 1,
  review: {
    min_severity: "suggestion",
    focus: ["security", "bugs", "performance", "error_handling"],
    ignore: [
      "**/*.test.js",
      "**/*.spec.js",
      "**/*.min.js",
      "**/*.generated.js",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
    ],
    fail_on_critical: false,
    max_files: 20,
    custom_instructions: "",
  },
}