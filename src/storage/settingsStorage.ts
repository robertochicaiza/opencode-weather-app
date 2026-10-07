import { homedir } from "node:os";
import { join } from "node:path";
import type { Settings } from "../types/Config.ts";

const CONFIG_DIR = join(homedir(), ".weather-cli");
const SETTINGS_PATH = join(CONFIG_DIR, "settings.json");
const LEGACY_PATH = join(CONFIG_DIR, "config.json");

async function readJson(path: string): Promise<Record<string, unknown> | undefined> {
  const file = Bun.file(path);
  if (!(await file.exists())) return undefined;
  try {
    return (await file.json()) as Record<string, unknown>;
  } catch {
    console.log(
      `\n  No se pudo leer ${path}. Se usará la configuración por defecto.`,
    );
    return undefined;
  }
}

export async function loadSettings(): Promise<Settings> {
  let saved = await readJson(SETTINGS_PATH);
  const fromLegacy = saved === undefined && (await Bun.file(LEGACY_PATH).exists());
  if (fromLegacy) saved = await readJson(LEGACY_PATH);
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
  await Bun.write(SETTINGS_PATH, `${JSON.stringify(settings, null, 2)}\n`);
}
