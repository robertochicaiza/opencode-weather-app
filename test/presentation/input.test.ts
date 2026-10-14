import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { LineReader, ask, parseIndex, isMenuOption } from "../../src/presentation/input.ts"
import { makeReadlineStream } from "../setup.ts"

describe("input", () => {
  it("LineReader queues lines FIFO", async () => {
    const stream = makeReadlineStream(["a", "b"], true)
    const reader = new LineReader(stream as any, process.stdout as any)
    const l1 = await reader.read()
    const l2 = await reader.read()
    expect(l1).toBe("a")
    expect(l2).toBe("b")
    reader.close()
  })

  it("ask uses reader", async () => {
    const stream = makeReadlineStream(["hello"], true)
    const r = new LineReader(stream as any, process.stdout as any)
    const v = await ask(r, "prompt")
    expect(v).toBe("hello")
    r.close()
  })

  it("resolves null on EOF", async () => {
    const stream = makeReadlineStream([], true)
    const r = new LineReader(stream as any, process.stdout as any)
    const v = await r.read()
    expect(v).toBeNull()
    r.close()
  })

  it("parseIndex parses integers", () => {
    expect(parseIndex("1", 5)).toBe(0)
    expect(parseIndex("2", 5)).toBe(1)
    expect(parseIndex("abc", 5)).toBeUndefined()
    expect(parseIndex("10", 5)).toBeUndefined()
  })

  it("isMenuOption validates", () => {
    expect(isMenuOption("1")).toBe(true)
    expect(isMenuOption("9")).toBe(true)
    expect(isMenuOption("0")).toBe(false)
    expect(isMenuOption("10")).toBe(false)
  })
})
