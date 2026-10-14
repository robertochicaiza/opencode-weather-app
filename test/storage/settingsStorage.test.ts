import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import path from "node:path"
import fs from "node:fs"
import os from "node:os"
import { spyOn } from "bun:test"
import {
  createTempDir,
  cleanupTempDir,
  restoreEnvTTY,
  withNoColor,
} from "../setup.ts"
import { loadSettings } from "../../src/storage/settingsStorage.ts"

describe("settingsStorage", () => {
  let tempDir: string
  let spy: any

  beforeEach(() => {
    tempDir = createTempDir()
    spy = spyOn(os, "homedir").mockReturnValue(tempDir)
    withNoColor(true)
    restoreEnvTTY()
  })
  afterEach(() => {
    spy?.mockRestore?.()
    cleanupTempDir(tempDir)
    restoreEnvTTY()
  })

  it("defaults to celsius when missing", async () => {
    const s = await loadSettings()
    expect(s.unit).toBe("celsius")
  })
})
