import os from "node:os"
import { spyOn, describe, it, expect, beforeEach, afterEach } from "bun:test"
import { createTempDir, cleanupTempDir, mockFetch, restoreFetch, withNoColor, restoreEnvTTY } from "../setup.ts"
import { showDefaultCity } from "../../src/actions/getWeather.ts"

describe("getWeather", () => {
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

  it("fetches weather and prints", async () => {
    mockFetch(async () => {
      const body = {
        current: { time: "2026-10-07T12:00", temperature_2m: 20, apparent_temperature: 21, relative_humidity_2m: 50, wind_speed_10m: 5, weather_code: 1, is_day: 1 },
        current_units: { temperature_2m: "°C", wind_speed_10m: "km/h", relative_humidity_2m: "%" },
      }
      return new Response(JSON.stringify(body), { status: 200 })
    })
    const out: string[] = []
    const orig = process.stdout.write
    process.stdout.write = ((s: any) => { out.push(String(s)); return true }) as any
    const cfg = { defaultCity: { id: 1, name: "A", latitude: 1, longitude: 2, country: "ES", admin1: "", timezone: "" }, cities: [], settings: { unit: "celsius" } } as any
    await showDefaultCity(cfg)
    process.stdout.write = orig
    expect(out.length > 0).toBe(true)
  })
})
