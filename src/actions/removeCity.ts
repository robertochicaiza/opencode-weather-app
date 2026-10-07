import { blue, magenta } from "../utils/colors.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { ask, parseIndex } from "../presentation/input.ts";
import { cityLabel } from "../utils/format.ts";
import { listCities } from "./listCities.ts";
import type { LineReader } from "../presentation/input.ts";
import type { Config } from "../types/Config.ts";

export async function removeCity(
  config: Config,
  reader: LineReader,
): Promise<void> {
  if (config.cities.length === 0) {
    console.log("\n  No hay ciudades guardadas.");
    return;
  }
  listCities(config);
  const answer = await ask(reader, "  Número de ciudad a eliminar: ");
  if (answer === null) return;
  const index = parseIndex(answer, config.cities.length);
  if (index === undefined) {
    console.log(magenta("\n  Opción no válida."));
    return;
  }
  const city = config.cities[index];
  if (!city) return;
  if (config.defaultCity?.id === city.id) {
    console.log(
      `\n  ${cityLabel(city)} es la ciudad default. Establece otra con la opción 5 antes de eliminarla.`,
    );
    return;
  }
  config.cities.splice(index, 1);
  await saveCities(config);
  console.log(blue(`\n  ${cityLabel(city)} eliminada.`));
}
