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
import {
  loadCities,
  saveCities,
} from "../../src/storage/citiesStorage.ts"

describe("citiesStorage", () => {
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

  it("creates default cities.json when missing", async () => {
    const config = await loadCities()
    expect(config.defaultCity).toBeNull()
    expect(config.cities).toEqual([])
  })

  it("saves and loads cities", async () => {
    const cfg = { defaultCity: null as any, cities: [{ id: 1, name: "Madrid", latitude: 40.4, longitude: -3.7, country: "", admin1: "", timezone: "" }] }
    await saveCities(cfg as any)
    const loaded = await loadCities()
    expect(loaded.cities.length).toBe(1)
    expect(loaded.cities[0]?.name).toBe("Madrid")
  })
})
