import { describe, it, expect } from "bun:test"
import { listCities } from "../../src/actions/listCities.ts"

describe("listCities", () => {
  it("lists cities", () => {
    const cfg = {
      defaultCity: { id: 1, name: "Madrid", latitude: 1, longitude: 2 },
      cities: [
        { id: 1, name: "Madrid", latitude: 1, longitude: 2 },
        { id: 2, name: "Barcelona", latitude: 3, longitude: 4 },
      ],
      settings: { unit: "celsius" },
    } as any
    const out: string[] = []
    const orig = process.stdout.write
    process.stdout.write = ((s: any) => { out.push(String(s)); return true }) as any
    listCities(cfg)
    process.stdout.write = orig
    const joined = out.join("")
    expect(joined).toContain("Madrid")
    expect(joined).toContain("Barcelona")
  })
})
