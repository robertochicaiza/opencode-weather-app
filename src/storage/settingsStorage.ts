import os from "node:os";
import { join } from "node:path";
import type { Settings } from "../types/Config.ts";
import { println } from "../utils/print.ts";

function configDir(): string {
  return join(os.homedir(), ".weather-cli");
}

function settingsPath(): string {
  return join(configDir(), "settings.json");
}

function legacyPath(): string {
  return join(configDir(), "config.json");
}

async function readJson(path: string): Promise<Record<string, unknown> | undefined> {
  const file = Bun.file(path);
  if (!(await file.exists())) return undefined;
  try {
    return (await file.json()) as Record<string, unknown>;
  } catch {
    println(
      `\n  No se pudo leer ${path}. Se usará la configuración por defecto.`,
    );
    return undefined;
  }
}

export async function loadSettings(): Promise<Settings> {
  let saved = await readJson(settingsPath());
  const fromLegacy = saved === undefined && (await Bun.file(legacyPath()).exists());
  if (fromLegacy) saved = await readJson(legacyPath());
  const nested = saved?.settings as { unit?: unknown } | undefined;
  const unit =
    saved?.unit === "fahrenheit" || nested?.unit === "fahrenheit"
      ? "fahrenheit"
      : "celsius";
  const settings: Settings = { unit };
  if (fromLegacy && saved !== undefined) await saveSettings(settings);
  return settings;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await Bun.write(settingsPath(), `${JSON.stringify(settings, null, 2)}\n`);
}
