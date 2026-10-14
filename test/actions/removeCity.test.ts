import os from "node:os"
import { spyOn, describe, it, expect, beforeEach, afterEach } from "bun:test"
import { createTempDir, cleanupTempDir, withNoColor, restoreEnvTTY } from "../setup.ts"
import { removeCity } from "../../src/actions/removeCity.ts"

describe("removeCity", () => {
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
    const cfg = { defaultCity: { id: 1, name: "A", latitude: 1, longitude: 2 }, cities: [{ id: 1, name: "A", latitude: 1, longitude: 2 }], settings: { unit: "celsius" } } as any
    await removeCity(cfg, { read: async () => "9", close: () => {} } as any)
    expect(cfg.cities.length).toBe(1)
  })
})
