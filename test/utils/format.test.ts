import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { cityLabel, dayLabel, toMessage } from "../../src/utils/format.ts"
import { withNoColor, withTTY, restoreEnvTTY } from "../setup.ts"

describe("format", () => {
  beforeEach(() => {
    withNoColor(true)
    withTTY(true)
  })
  afterEach(() => {
    restoreEnvTTY()
  })

  describe("cityLabel", () => {
    it("formats city", () => {
      const label = cityLabel({ name: "Madrid" } as any)
      expect(label).toContain("Madrid")
    })
  })

  describe("dayLabel", () => {
    it("returns 'hoy ...' when isToday true", () => {
      const today = new Date()
      const y = today.getUTCFullYear()
      const m = String(today.getUTCMonth() + 1).padStart(2, "0")
      const d = String(today.getUTCDate()).padStart(2, "0")
      const label = dayLabel(`${y}-${m}-${d}`, true)
      expect(label.startsWith("hoy")).toBe(true)
    })

    it("returns weekday for other days", () => {
      const dayAfter = new Date(Date.now() + 2 * 86400000)
      const y = dayAfter.getUTCFullYear()
      const m = String(dayAfter.getUTCMonth() + 1).padStart(2, "0")
      const d = String(dayAfter.getUTCDate()).padStart(2, "0")
      const label = dayLabel(`${y}-${m}-${d}`, false)
      expect(label.startsWith("hoy")).toBe(false)
      expect(label.length > 0).toBe(true)
    })
  })

  describe("toMessage", () => {
    it("maps known WMO codes", () => {
      expect(toMessage(0)).toBeTruthy()
    })
    it("returns fallback for unknown code", () => {
      const s = toMessage(9999 as any)
      expect(s).toBeDefined()
      expect(typeof s).toBe("string")
    })
  })
})
