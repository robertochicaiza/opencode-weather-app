import os from "node:os"
import { spyOn, describe, it, expect, beforeEach, afterEach } from "bun:test"
import { createTempDir, cleanupTempDir, mockFetch, restoreFetch, withNoColor, restoreEnvTTY } from "../setup.ts"
import { showHourly } from "../../src/actions/getHourly.ts"

describe("getHourly", () => {
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

  it("fetches hourly and prints", async () => {
    mockFetch(async () => {
      const body = {
        current: { time: "2026-10-07T12:00" },
        hourly: {
          time: ["2026-10-07T12:00","2026-10-07T15:00","2026-10-07T18:00"],
          temperature_2m: [20,22,18],
          weather_code: [1,2,3],
          precipitation_probability: [10,20,30],
        },
        hourly_units: { temperature_2m: "°C" },
      }
      return new Response(JSON.stringify(body), { status: 200 })
    })
    const out: string[] = []
    const orig = process.stdout.write
    process.stdout.write = ((s: any) => { out.push(String(s)); return true }) as any
    const cfg = { defaultCity: null, cities: [{ id: 1, name: "A", latitude: 1, longitude: 2, country: "ES", admin1: "", timezone: "" }], settings: { unit: "celsius" } } as any
    const reader = { read: async () => "1", close: () => {} } as any
    await showHourly(cfg, reader)
    process.stdout.write = orig
    expect(out.length > 0).toBe(true)
  })
})
