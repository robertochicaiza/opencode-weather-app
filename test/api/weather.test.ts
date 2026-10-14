import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { mockFetch, restoreFetch, withNoColor, withTTY, restoreEnvTTY } from "../setup.ts"
import { fetchForecast, fetchHourly, fetchWeather } from "../../src/api/weather.ts"

describe("weather", () => {
  beforeEach(() => {
    withNoColor(true)
    withTTY(true)
    restoreFetch()
  })
  afterEach(() => {
    restoreFetch()
    restoreEnvTTY()
  })

  it("fetchForecast skips days with missing max/min", async () => {
    const now = new Date()
    const d0 = `${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}-${String(now.getUTCDate()).padStart(2,'0')}`
    const d1 = new Date(now.getTime()+86400000)
    const d1s = `${d1.getUTCFullYear()}-${String(d1.getUTCMonth()+1).padStart(2,'0')}-${String(d1.getUTCDate()).padStart(2,'0')}`
    mockFetch(async () => {
      const body = {
        daily: {
          time: [d0, d1s],
          temperature_2m_max: [25, null as any],
          temperature_2m_min: [15, 10],
          weather_code: [1, 2],
        },
        daily_units: { temperature_2m_max: "�C", temperature_2m_min: "�C" },
      }
      return new Response(JSON.stringify(body), { status: 200 })
    })
    const res = await fetchForecast({ latitude: 40, longitude: -3 } as any, "celsius")
    expect(res.days.length).toBe(1)
    expect(res.days[0]?.date).toBe(d0)
  })

  it("fetchHourly drops past hours", async () => {
    mockFetch(async () => {
      const body = {
        current: { time: "2026-10-07T12:00" },
        hourly: {
          time: [
            "2026-10-07T10:00","2026-10-07T11:00","2026-10-07T12:00","2026-10-07T13:00",
            "2026-10-07T14:00","2026-10-07T15:00","2026-10-07T16:00","2026-10-07T17:00",
            "2026-10-07T18:00",
          ],
          temperature_2m: [0, 0, 20, 21, 22, 23, 24, 25, 26],
          weather_code: [0, 0, 1, 1, 1, 2, 2, 3, 3],
          precipitation_probability: [0, 0, 10, 10, 15, 20, 20, 30, 30],
        },
        hourly_units: { temperature_2m: "�C" },
      }
      return new Response(JSON.stringify(body), { status: 200 })
    })
    const res = await fetchHourly({ latitude: 40, longitude: -3 } as any, "celsius")
    expect(res.hours[0]?.time.startsWith("2026-10-07T12")).toBe(true)
    expect(res.hours.length).toBe(3)
  })
})
