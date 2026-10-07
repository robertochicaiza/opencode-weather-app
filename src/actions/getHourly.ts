import { fetchHourly } from "../api/weather.ts";
import { magenta } from "../utils/colors.ts";
import { printHourly } from "../presentation/output.ts";
import { cityLabel, toMessage } from "../utils/format.ts";
import { selectCity } from "./selectCity.ts";
import type { LineReader } from "../presentation/input.ts";
import type { Config } from "../types/Config.ts";

export async function showHourly(
  config: Config,
  reader: LineReader,
): Promise<void> {
  const city = await selectCity(
    config,
    reader,
    "  Ciudad para el pronóstico por horas: ",
  );
  if (!city) return;
  try {
    printHourly(city, await fetchHourly(city, config.settings.unit));
  } catch (error) {
    console.log(`\n  ${cityLabel(city)}`);
    console.log(
      magenta(`  Error al obtener el pronóstico por horas: ${toMessage(error)}`),
    );
  }
}
