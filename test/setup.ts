import { afterEach } from "bun:test"
import os from "node:os"
import path from "node:path"
import fs from "node:fs"
import { Readable } from "node:stream"

let originalNoColor: string | undefined = process.env.NO_COLOR
let originalIsTTY: boolean | undefined = (process.stdout as any).isTTY
let originalFetch: typeof globalThis.fetch | undefined = globalThis.fetch

export function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "weather-cli-test-"))
}

export function cleanupTempDir(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true })
  } catch {
    // ignore
  }
}

export function withNoColor(value: boolean): void {
  if (value) {
    process.env.NO_COLOR = "1"
  } else {
    delete process.env.NO_COLOR
  }
}

export function withTTY(value: boolean): void {
  Object.defineProperty(process.stdout, "isTTY", {
    value,
    configurable: true,
    writable: true,
  })
}

export function restoreEnvTTY(): void {
  if (originalNoColor === undefined) {
    delete process.env.NO_COLOR
  } else {
    process.env.NO_COLOR = originalNoColor
  }
  Object.defineProperty(process.stdout, "isTTY", {
    value: originalIsTTY,
    configurable: true,
    writable: true,
  })
}

export function mockFetch(
  handler: (input: any, init?: any) => Promise<Response> | Response
): void {
  originalFetch = globalThis.fetch
  globalThis.fetch = ((input: any, init?: any) => {
    return Promise.resolve(handler(input, init))
  }) as any
}

export function restoreFetch(): void {
  if (originalFetch) {
    globalThis.fetch = originalFetch
  }
}

export function makeReadlineStream(lines: string[], end = true): Readable {
  const stream = new Readable({
    read() {
      // will push on next tick
    },
  })
  const toPush = [...lines]
  queueMicrotask(() => {
    for (const line of toPush) {
      stream.push(line + "\n")
    }
    if (end) {
      stream.push(null)
    }
  })
  return stream
}

afterEach(() => {
  restoreEnvTTY()
  restoreFetch()
})
