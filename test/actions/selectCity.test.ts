import os from "node:os"
import { spyOn, describe, it, expect, beforeEach, afterEach } from "bun:test"
import { createTempDir, cleanupTempDir, withNoColor, restoreEnvTTY } from "../setup.ts"
import { selectCity } from "../../src/actions/selectCity.ts"
import { saveCities } from "../../src/storage/citiesStorage.ts"

describe("selectCity", () => {
  let tempDir: string
  let spy: any
  beforeEach(async () => {
    tempDir = createTempDir()
    spy = spyOn(os, "homedir").mockReturnValue(tempDir)
    withNoColor(true)
    restoreEnvTTY()
    await saveCities({
      defaultCity: { name: "A", latitude: 1, longitude: 2 },
      cities: [
        { name: "A", latitude: 1, longitude: 2 },
        { name: "B", latitude: 3, longitude: 4 },
      ],
    } as any)
  })
  afterEach(() => {
    spy?.mockRestore?.()
    cleanupTempDir(tempDir)
    restoreEnvTTY()
  })

  it("returns city for valid index", async () => {
    const res = await selectCity({ ...(await (await import("../../src/storage/citiesStorage.ts")).loadCities()), settings: { unit: "celsius" } } as any, { read: async () => "2", close: () => {} } as any, "Elige: ")
    expect(res?.name).toBe("B")
  })

  it("returns undefined for invalid index", async () => {
    const cfg = { ...(await (await import("../../src/storage/citiesStorage.ts")).loadCities()), settings: { unit: "celsius" } } as any
    const res = await selectCity(cfg, { read: async () => "5", close: () => {} } as any, "Elige: ")
    expect(res).toBeUndefined()
  })

  it("returns undefined for non-numeric", async () => {
    const cfg = { ...(await (await import("../../src/storage/citiesStorage.ts")).loadCities()), settings: { unit: "celsius" } } as any
    const res = await selectCity(cfg, { read: async () => "x", close: () => {} } as any, "Elige: ")
    expect(res).toBeUndefined()
  })
})
