import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { mockFetch, restoreFetch, withNoColor, withTTY, restoreEnvTTY } from "../setup.ts"
import { searchCity } from "../../src/api/geocoding.ts"

describe("geocoding", () => {
  beforeEach(() => {
    withNoColor(true)
    withTTY(true)
    restoreFetch()
  })
  afterEach(() => {
    restoreFetch()
    restoreEnvTTY()
  })

  it("returns results when present", async () => {
    mockFetch(async () => {
      const body = { results: [{ id: 1, name: "Madrid", latitude: 40.4168, longitude: -3.7038, country: "ES" }] }
      return new Response(JSON.stringify(body), { status: 200 })
    })
    const res = await searchCity("Madrid")
    expect(res.length).toBe(1)
    expect(res[0]?.name).toBe("Madrid")
  })

  it("returns empty array when results absent", async () => {
    mockFetch(async () => {
      return new Response(JSON.stringify({}), { status: 200 })
    })
    const res = await searchCity("Nowhere")
    expect(res).toEqual([])
  })
})
