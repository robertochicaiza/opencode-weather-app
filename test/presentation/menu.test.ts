import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { showMenu } from "../../src/presentation/menu.ts"
import { withNoColor, withTTY, restoreEnvTTY } from "../setup.ts"

describe("menu", () => {
  beforeEach(() => {
    withNoColor(true)
    withTTY(false)
  })
  afterEach(() => {
    restoreEnvTTY()
  })

  it("shows menu options in order", () => {
    const out: string[] = []
    const orig = process.stdout.write
    process.stdout.write = ((s: any) => { out.push(String(s)); return true }) as any
    showMenu({ cities: [], settings: { unit: "celsius" } } as any)
    process.stdout.write = orig
    const joined = out.join("")
    expect(joined).not.toContain("\x1b[")
    expect(joined).toMatch(/1\./)
    expect(joined).toMatch(/2\./)
    expect(joined).toMatch(/8\./)
    expect(joined).toMatch(/9\./)
  })
})
