import { blue, magenta } from "../utils/colors.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { ask, parseIndex } from "../presentation/input.ts";
import { cityLabel } from "../utils/format.ts";
import { listCities } from "./listCities.ts";
import type { LineReader } from "../presentation/input.ts";
import type { Config } from "../types/Config.ts";
import { println } from "../utils/print.ts";

export async function setDefaultCity(
  config: Config,
  reader: LineReader,
): Promise<void> {
  if (config.cities.length === 0) {
    println("\n  No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }
  listCities(config);
  const answer = await ask(reader, "  Número de ciudad default: ");
  if (answer === null) return;
  const index = parseIndex(answer, config.cities.length);
  if (index === undefined) {
    println(magenta("\n  Opción no válida."));
    return;
  }
  const city = config.cities[index];
  if (!city) return;
  config.defaultCity = city;
  await saveCities(config);
  println(blue(`\n  Ciudad default: ${cityLabel(city)}`));
}
