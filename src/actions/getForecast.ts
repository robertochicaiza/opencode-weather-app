import { fetchForecast } from "../api/weather.ts";
import { magenta } from "../utils/colors.ts";
import { printForecast } from "../presentation/output.ts";
import { cityLabel, toMessage } from "../utils/format.ts";
import { selectCity } from "./selectCity.ts";
import type { LineReader } from "../presentation/input.ts";
import type { Config } from "../types/Config.ts";

export async function showForecast(
  config: Config,
  reader: LineReader,
): Promise<void> {
  const city = await selectCity(config, reader, "  Ciudad para el pronóstico: ");
  if (!city) return;
  try {
    printForecast(city, await fetchForecast(city, config.settings.unit));
  } catch (error) {
    console.log(`\n  ${cityLabel(city)}`);
    console.log(magenta(`  Error al obtener el pronóstico: ${toMessage(error)}`));
  }
}
