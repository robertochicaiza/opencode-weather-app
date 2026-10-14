import os from "node:os"
import { spyOn, describe, it, expect, beforeEach, afterEach } from "bun:test"
import { createTempDir, cleanupTempDir, withNoColor, restoreEnvTTY } from "../setup.ts"
import { toggleUnit } from "../../src/actions/toggleUnit.ts"

describe("toggleUnit", () => {
  let tempDir: string
  let spy: any
  beforeEach(async () => {
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

  it("toggles unit", async () => {
    const cfg = { settings: { unit: "celsius" }, cities: [], defaultCity: null } as any
    const out: string[] = []
    const orig = process.stdout.write
    process.stdout.write = ((s: any) => { out.push(String(s)); return true }) as any
    await toggleUnit(cfg)
    process.stdout.write = orig
    expect(cfg.settings.unit).toBe("fahrenheit")
  })
})
