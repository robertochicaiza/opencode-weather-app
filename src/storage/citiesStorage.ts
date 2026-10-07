import { homedir } from "node:os";
import { join } from "node:path";
import type { Config } from "../types/Config.ts";
import type { City } from "../types/City.ts";

const CONFIG_DIR = join(homedir(), ".weather-cli");
const CITIES_PATH = join(CONFIG_DIR, "cities.json");
const LEGACY_PATH = join(CONFIG_DIR, "config.json");

type StoredCities = Pick<Config, "defaultCity" | "cities">;

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

export async function loadCities(): Promise<StoredCities> {
  let saved = await readJson(CITIES_PATH);
  const fromLegacy = saved === undefined && (await Bun.file(LEGACY_PATH).exists());
  if (fromLegacy) saved = await readJson(LEGACY_PATH);
  const stored: StoredCities = {
    defaultCity: (saved?.defaultCity as City | null | undefined) ?? null,
    cities: Array.isArray(saved?.cities) ? (saved.cities as City[]) : [],
  };
  if (fromLegacy && saved !== undefined) await saveCities(stored);
  return stored;
}

export async function saveCities(stored: StoredCities): Promise<void> {
  await Bun.write(CITIES_PATH, `${JSON.stringify(stored, null, 2)}\n`);
}
