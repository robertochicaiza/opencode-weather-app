import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import {
  createTempDir,
  cleanupTempDir,
  mockFetch,
  restoreFetch,
  withNoColor,
  restoreEnvTTY,
} from "../setup.ts"
import os from "node:os"
import { spyOn } from "bun:test"
import { loadCities, saveCities } from "../../src/storage/citiesStorage.ts"
import { addCity } from "../../src/actions/addCity.ts"

describe("integration flow", () => {
  let tempDir: string
  let spy: any

  beforeEach(async () => {
    tempDir = createTempDir()
    spy = spyOn(os, "homedir").mockReturnValue(tempDir)
    withNoColor(true)
    restoreEnvTTY()
    restoreFetch()
    await saveCities({ defaultCity: null as any, cities: [] })
  })

  afterEach(() => {
    spy?.mockRestore?.()
    cleanupTempDir(tempDir)
    restoreFetch()
    restoreEnvTTY()
  })

  it("runs basic flows with mocks", async () => {
    mockFetch(async (input) => {
      const url = String(input)
      if (url.includes("geocoding")) {
        const body = { results: [{ id: 1, name: "Madrid", latitude: 40.4168, longitude: -3.7038, country: "ES" }] }
        return new Response(JSON.stringify(body), { status: 200 })
      }
      return new Response("{}", { status: 200 })
    })

    const cfg = { ...(await loadCities()), settings: { unit: "celsius" } } as any
    const q = ["Madrid", "1"]
    const out: string[] = []
    const orig = process.stdout.write
    process.stdout.write = ((s: any) => { out.push(String(s)); return true }) as any
    await addCity(cfg, { read: async () => q.shift() ?? null, close: () => {} } as any)
    process.stdout.write = orig
    expect(out.length > 0).toBe(true)
  })
})
