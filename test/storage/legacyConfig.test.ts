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
import { loadCities } from "../../src/storage/citiesStorage.ts"
import { loadSettings } from "../../src/storage/settingsStorage.ts"

describe("legacy config migration", () => {
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

  it("reads from legacy config.json", async () => {
    const dir = path.join(tempDir, ".weather-cli")
    fs.mkdirSync(dir, { recursive: true })
    const legacy = {
      defaultCity: { id: 1, name: "Roma", latitude: 41.9, longitude: 12.5 },
      cities: [
        { id: 1, name: "Roma", latitude: 41.9, longitude: 12.5 },
        { id: 2, name: "Milano", latitude: 45.4642, longitude: 9.19 },
      ],
      settings: { unit: "fahrenheit" },
    }
    fs.writeFileSync(path.join(dir, "config.json"), JSON.stringify(legacy))
    const cities = await loadCities()
    const settings = await loadSettings()
    expect(cities.cities.length).toBe(2)
    expect(settings.unit).toBe("fahrenheit")
  })
})
