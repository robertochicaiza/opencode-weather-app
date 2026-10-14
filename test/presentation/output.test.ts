import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { printWeather, printForecast, printHourly } from "../../src/presentation/output.ts"
import { withNoColor, withTTY, restoreEnvTTY } from "../setup.ts"

describe("output", () => {
  beforeEach(() => {
    withNoColor(true)
    withTTY(false)
  })
  afterEach(() => {
    restoreEnvTTY()
  })

  it("printWeather produces plain text when no color/TTY", () => {
    const out: string[] = []
    const orig = process.stdout.write
    process.stdout.write = ((s: any) => { out.push(String(s)); return true }) as any
    printWeather({ name: "Test" } as any, {
      time: "2026-10-07T12:00",
      temperature: 20,
      apparentTemperature: 21,
      humidity: 50,
      windSpeed: 5,
      weatherCode: 1,
      isDay: true,
      temperatureUnit: "�C",
      humidityUnit: "%",
      windUnit: "km/h",
    } as any)
    process.stdout.write = orig
    const joined = out.join("")
    expect(joined).not.toContain("\x1b[")
    expect(joined).toContain("Test")
  })

  it("printForecast produces plain text", () => {
    const out: string[] = []
    const orig = process.stdout.write
    process.stdout.write = ((s: any) => { out.push(String(s)); return true }) as any
    printForecast({ name: "Test" } as any, {
      days: [
        { date: "2026-10-07", weatherCode: 1, max: 25, min: 15 },
      ],
      temperatureUnit: "�C",
    } as any)
    process.stdout.write = orig
    const joined = out.join("")
    expect(joined).not.toContain("\x1b[")
    expect(joined).toContain("Test")
  })

  it("printHourly produces plain text", () => {
    const out: string[] = []
    const orig = process.stdout.write
    process.stdout.write = ((s: any) => { out.push(String(s)); return true }) as any
    printHourly({ name: "Test" } as any, {
      hours: [
        { time: "2026-10-07T12:00", temperature: 20, weatherCode: 1, precipitationProbability: 10 },
      ],
      currentHour: "2026-10-07T12:00",
      temperatureUnit: "�C",
    } as any)
    process.stdout.write = orig
    const joined = out.join("")
    expect(joined).not.toContain("\x1b[")
  })
})
