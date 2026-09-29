import { homedir } from "node:os";
import { join } from "node:path";
import type { Config } from "./types.ts";

const CONFIG_PATH = join(homedir(), ".weather-cli", "config.json");

function createDefaultConfig(): Config {
  return { defaultCity: null, cities: [], settings: { unit: "celsius" } };
}

export async function loadConfig(): Promise<Config> {
  const file = Bun.file(CONFIG_PATH);
  if (!(await file.exists())) return createDefaultConfig();
  try {
    const saved = (await file.json()) as Partial<Config>;
    return {
      defaultCity: saved.defaultCity ?? null,
      cities: Array.isArray(saved.cities) ? saved.cities : [],
      settings: {
        unit: saved.settings?.unit === "fahrenheit" ? "fahrenheit" : "celsius",
      },
    };
  } catch {
    console.log(
      `\n  No se pudo leer ${CONFIG_PATH}. Se usará la configuración por defecto.`,
    );
    return createDefaultConfig();
  }
}

export async function saveConfig(config: Config): Promise<void> {
  await Bun.write(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`);
}
