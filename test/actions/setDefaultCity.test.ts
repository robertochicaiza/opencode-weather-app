import os from "node:os"
import { spyOn, describe, it, expect, beforeEach, afterEach } from "bun:test"
import { createTempDir, cleanupTempDir, withNoColor, restoreEnvTTY } from "../setup.ts"
import { setDefaultCity } from "../../src/actions/setDefaultCity.ts"

describe("setDefaultCity", () => {
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

  it("handles invalid index", async () => {
    const cfg = { defaultCity: { id: 1, name: "A", latitude: 1, longitude: 2 }, cities: [{ id: 1, name: "A", latitude: 1, longitude: 2 }, { id: 2, name: "B", latitude: 3, longitude: 4 }], settings: { unit: "celsius" } } as any
    await setDefaultCity(cfg, { read: async () => "x", close: () => {} } as any)
    expect(cfg.defaultCity?.name).toBe("A")
  })
})
