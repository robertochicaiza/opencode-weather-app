const enabled = !process.env.NO_COLOR && Boolean(process.stdout.isTTY);

function paint(code: number, text: string): string {
  return enabled ? `\x1b[${code}m${text}\x1b[0m` : text;
}

export function cyan(text: string): string {
  return paint(36, text);
}

export function yellow(text: string): string {
  return paint(33, text);
}

export function green(text: string): string {
  return paint(32, text);
}

export function red(text: string): string {
  return paint(31, text);
}
