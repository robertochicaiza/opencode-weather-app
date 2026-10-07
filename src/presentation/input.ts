import { createInterface } from "node:readline/promises";
import type { Interface } from "node:readline/promises";
import type { MenuOption } from "../types/MenuOption.ts";

const MENU_OPTIONS: readonly MenuOption[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];

export class LineReader {
  #rl: Interface;
  #queue: string[] = [];
  #pending: ((line: string | null) => void) | null = null;
  #ended = false;

  constructor(input: typeof process.stdin, output: typeof process.stdout) {
    this.#rl = createInterface({ input, output });
    this.#rl.on("line", (line) => {
      const pending = this.#pending;
      if (pending) {
        this.#pending = null;
        pending(line);
      } else {
        this.#queue.push(line);
      }
    });
    this.#rl.on("close", () => {
      this.#ended = true;
      const pending = this.#pending;
      if (pending) {
        this.#pending = null;
        pending(null);
      }
    });
  }

  read(): Promise<string | null> {
    const queued = this.#queue.shift();
    if (queued !== undefined) return Promise.resolve(queued);
    if (this.#ended) return Promise.resolve(null);
    return new Promise((resolve) => {
      this.#pending = resolve;
    });
  }

  close(): void {
    this.#rl.close();
  }
}

export async function ask(
  reader: LineReader,
  question: string,
): Promise<string | null> {
  process.stdout.write(question);
  const line = await reader.read();
  return line === null ? null : line.trim();
}

export function parseIndex(
  answer: string,
  length: number,
): number | undefined {
  const index = Number.parseInt(answer, 10);
  if (!Number.isInteger(index) || index < 1 || index > length) return undefined;
  return index - 1;
}

export function isMenuOption(value: string): value is MenuOption {
  return (MENU_OPTIONS as readonly string[]).includes(value);
}
