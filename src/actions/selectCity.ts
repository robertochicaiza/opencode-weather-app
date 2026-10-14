import { magenta } from "../utils/colors.ts";
import { ask, parseIndex } from "../presentation/input.ts";
import { listCities } from "./listCities.ts";
import type { LineReader } from "../presentation/input.ts";
import type { City } from "../types/City.ts";
import type { Config } from "../types/Config.ts";
import { println } from "../utils/print.ts";

export async function selectCity(
  config: Config,
  reader: LineReader,
  prompt: string,
): Promise<City | undefined> {
  if (config.cities.length === 0) {
    println("\n  No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return undefined;
  }
  listCities(config);
  const answer = await ask(reader, prompt);
  if (answer === null) return undefined;
  const index = parseIndex(answer, config.cities.length);
  if (index === undefined) {
    println(magenta("\n  Opción no válida."));
    return undefined;
  }
  return config.cities[index];
}
