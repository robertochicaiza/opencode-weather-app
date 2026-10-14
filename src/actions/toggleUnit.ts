import { blue } from "../utils/colors.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import type { Config } from "../types/Config.ts";
import { println } from "../utils/print.ts";

export async function toggleUnit(config: Config): Promise<void> {
  config.settings.unit =
    config.settings.unit === "celsius" ? "fahrenheit" : "celsius";
  await saveSettings(config.settings);
  const label =
    config.settings.unit === "fahrenheit" ? "°F (Fahrenheit)" : "°C (Celsius)";
  println(blue(`\n  Unidad de temperatura: ${label}`));
}
