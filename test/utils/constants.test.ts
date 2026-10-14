import { describe, it, expect } from "bun:test"
import { GEOCODING_URL, FORECAST_URL, HOUR_STEP } from "../../src/utils/constants.ts"

describe("constants", () => {
  it("exports expected constants", () => {
    expect(typeof GEOCODING_URL).toBe("string")
    expect(GEOCODING_URL.length > 0).toBe(true)
    expect(typeof FORECAST_URL).toBe("string")
    expect(FORECAST_URL.length > 0).toBe(true)
    expect(HOUR_STEP).toBe(3)
  })
})
