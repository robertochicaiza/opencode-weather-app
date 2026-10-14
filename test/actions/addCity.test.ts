import os from "node:os"
import { spyOn, describe, it, expect, beforeEach, afterEach } from "bun:test"
import { createTempDir, cleanupTempDir, mockFetch, restoreFetch, withNoColor, restoreEnvTTY } from "../setup.ts"
import { addCity } from "../../src/actions/addCity.ts"

describe("addCity", () => {
  let tempDir: string
  let spy: any
  beforeEach(async () => {
    tempDir = createTempDir()
    spy = spyOn(os, "homedir").mockReturnValue(tempDir)
    withNoColor(true)
    restoreEnvTTY()
    restoreFetch()
  })
  afterEach(() => {
    spy?.mockRestore?.()
    cleanupTempDir(tempDir)
    restoreFetch()
    restoreEnvTTY()
  })

  it("adds city after selecting from geocode results", async () => {
    mockFetch(async () => {
      const body = {
        results: [
          { id: 1, name: "Madrid", latitude: 40.4168, longitude: -3.7038, country: "ES" },
        ],
      }
      return new Response(JSON.stringify(body), { status: 200 })
    })
    const out: string[] = []
    const orig = process.stdout.write
    process.stdout.write = ((s: any) => { out.push(String(s)); return true }) as any
    const config = { cities: [], defaultCity: null, settings: { unit: "celsius" } } as any
    const queue = ["Madrid", "1"]
    await addCity(config, { read: async () => queue.shift() ?? null, close: () => {} } as any)
    process.stdout.write = orig
    expect(config.cities.length).toBe(1)
  })
})
