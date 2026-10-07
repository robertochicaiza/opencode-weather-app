const enabled = !process.env.NO_COLOR && Boolean(process.stdout.isTTY);

function paint(code: number, text: string): string {
  return enabled ? `\x1b[${code}m${text}\x1b[0m` : text;
}

export function cyan(text: string): string {
  return paint(96, text);
}

export function yellow(text: string): string {
  return paint(93, text);
}

export function blue(text: string): string {
  return paint(94, text);
}

export function magenta(text: string): string {
  return paint(95, text);
}
