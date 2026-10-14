import { describe, it, expect, afterEach } from "bun:test"
import { cyan, yellow, blue, magenta } from "../../src/utils/colors.ts"

describe("colors", () => {
  const originalNoColor = process.env.NO_COLOR
  const originalTTY = (process.stdout as any).isTTY

  afterEach(() => {
    if (originalNoColor === undefined) {
      delete process.env.NO_COLOR
    } else {
      process.env.NO_COLOR = originalNoColor
    }
    Object.defineProperty(process.stdout, "isTTY", {
      value: originalTTY,
      configurable: true,
      writable: true,
    })
  })

  it("disables when NO_COLOR is set", () => {
    process.env.NO_COLOR = "1"
    Object.defineProperty(process.stdout, "isTTY", {
      value: true,
      configurable: true,
      writable: true,
    })
    expect(cyan("x")).toBe("x")
    expect(yellow("x")).toBe("x")
    expect(blue("x")).toBe("x")
    expect(magenta("x")).toBe("x")
  })

  it("disables when not TTY", () => {
    delete process.env.NO_COLOR
    Object.defineProperty(process.stdout, "isTTY", {
      value: false,
      configurable: true,
      writable: true,
    })
    expect(cyan("x")).toBe("x")
    expect(magenta("err")).toBe("err")
  })
})
