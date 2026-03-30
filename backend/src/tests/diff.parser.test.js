import { describe, it, expect } from "vitest"
import { parseDiff } from "../modules/diff/diff.parser.js"

describe("parseDiff", () => {
  it("returns empty array for empty input", () => {
    expect(parseDiff("")).toEqual([])
    expect(parseDiff(null)).toEqual([])
  })

  it("parses a simple diff correctly", () => {
    const rawDiff = `diff --git a/src/index.js b/src/index.js
index 83db48f..bf269c2 100644
--- a/src/index.js
+++ b/src/index.js
@@ -1,3 +1,5 @@
 const express = require('express')
+const helmet = require('helmet')
+const app = express()
 module.exports = app`

    const result = parseDiff(rawDiff)

    expect(result).toHaveLength(1)
    expect(result[0].filename).toBe("src/index.js")
    expect(result[0].language).toBe("javascript")
    expect(result[0].hunks).toHaveLength(1)
  })

  it("filters out ignored files", () => {
    const rawDiff = `diff --git a/package-lock.json b/package-lock.json
index 83db48f..bf269c2 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -1,3 +1,4 @@
 {
+  "name": "test"
 }`

    const result = parseDiff(rawDiff)
    expect(result).toHaveLength(0)
  })

  it("parses multiple files", () => {
    const rawDiff = `diff --git a/src/auth.js b/src/auth.js
index 83db48f..bf269c2 100644
--- a/src/auth.js
+++ b/src/auth.js
@@ -1,2 +1,3 @@
 const auth = {}
+auth.login = () => {}
 module.exports = auth
diff --git a/src/db.js b/src/db.js
index 83db48f..bf269c2 100644
--- a/src/db.js
+++ b/src/db.js
@@ -1,2 +1,3 @@
 const db = {}
+db.connect = () => {}
 module.exports = db`

    const result = parseDiff(rawDiff)
    expect(result).toHaveLength(2)
    expect(result[0].filename).toBe("src/auth.js")
    expect(result[1].filename).toBe("src/db.js")
  })

  it("correctly identifies added and removed lines", () => {
    const rawDiff = `diff --git a/src/index.js b/src/index.js
index 83db48f..bf269c2 100644
--- a/src/index.js
+++ b/src/index.js
@@ -1,3 +1,3 @@
 const a = 1
-const b = 2
+const b = 3
 const c = 4`

    const result = parseDiff(rawDiff)
    const changes = result[0].hunks[0].changes

    const added = changes.filter((c) => c.type === "add")
    const removed = changes.filter((c) => c.type === "remove")

    expect(added).toHaveLength(1)
    expect(removed).toHaveLength(1)
    expect(added[0].content.trim()).toBe("const b = 3")
    expect(removed[0].content.trim()).toBe("const b = 2")
  })
})