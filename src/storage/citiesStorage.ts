import os from "node:os";
import { join } from "node:path";
import type { Config } from "../types/Config.ts";
import type { City } from "../types/City.ts";
import { println } from "../utils/print.ts";

function configDir(): string {
  return join(os.homedir(), ".weather-cli");
}

function citiesPath(): string {
  return join(configDir(), "cities.json");
}

function legacyPath(): string {
  return join(configDir(), "config.json");
}

type StoredCities = Pick<Config, "defaultCity" | "cities">;

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

export async function loadCities(): Promise<StoredCities> {
  let saved = await readJson(citiesPath());
  const fromLegacy = saved === undefined && (await Bun.file(legacyPath()).exists());
  if (fromLegacy) saved = await readJson(legacyPath());
  const stored: StoredCities = {
    defaultCity: (saved?.defaultCity as City | null | undefined) ?? null,
    cities: Array.isArray(saved?.cities) ? (saved.cities as City[]) : [],
  };
  if (fromLegacy && saved !== undefined) await saveCities(stored);
  return stored;
}

export async function saveCities(stored: StoredCities): Promise<void> {
  await Bun.write(citiesPath(), `${JSON.stringify(stored, null, 2)}\n`);
}
