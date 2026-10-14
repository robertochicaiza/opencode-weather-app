import os from "node:os"
import { spyOn, describe, it, expect, beforeEach, afterEach } from "bun:test"
import { createTempDir, cleanupTempDir, mockFetch, restoreFetch, withNoColor, restoreEnvTTY } from "../setup.ts"
import { showForecast } from "../../src/actions/getForecast.ts"

describe("getForecast", () => {
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

  it("fetches forecast and prints", async () => {
    const now = new Date()
    const d0 = `${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}-${String(now.getUTCDate()).padStart(2,'0')}`
    mockFetch(async () => {
      const body = {
        daily: {
          time: [d0],
          temperature_2m_max: [25],
          temperature_2m_min: [15],
          weather_code: [1],
        },
        daily_units: { temperature_2m_max: "°C", temperature_2m_min: "°C" },
      }
      return new Response(JSON.stringify(body), { status: 200 })
    })
    const out: string[] = []
    const orig = process.stdout.write
    process.stdout.write = ((s: any) => { out.push(String(s)); return true }) as any
    const cfg = { defaultCity: null, cities: [{ id: 1, name: "A", latitude: 1, longitude: 2, country: "ES", admin1: "", timezone: "" }], settings: { unit: "celsius" } } as any
    const reader = { read: async () => "1", close: () => {} } as any
    await showForecast(cfg, reader)
    process.stdout.write = orig
    expect(out.length > 0).toBe(true)
  })
})
