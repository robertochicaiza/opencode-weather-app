import { searchCity } from "../api/geocoding.ts";
import { blue, magenta } from "../utils/colors.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { ask, parseIndex } from "../presentation/input.ts";
import { cityLabel, toMessage } from "../utils/format.ts";
import type { LineReader } from "../presentation/input.ts";
import type { City } from "../types/City.ts";
import type { Config } from "../types/Config.ts";

async function pickCity(
  candidates: City[],
  reader: LineReader,
): Promise<City | undefined> {
  console.log("\n  Se encontraron varias coincidencias:");
  candidates.forEach((city, index) => {
    console.log(`   ${index + 1}. ${cityLabel(city)}`);
  });
  const answer = await ask(reader, "  Selecciona una opción: ");
  if (answer === null) return undefined;
  const index = parseIndex(answer, candidates.length);
  if (index === undefined) {
    console.log(magenta("\n  Opción no válida."));
    return undefined;
  }
  return candidates[index];
}

export async function addCity(
  config: Config,
  reader: LineReader,
): Promise<void> {
  const name = await ask(reader, "  Nombre de la ciudad: ");
  if (name === null) return;
  if (!name) {
    console.log("\n  No se escribió ningún nombre.");
    return;
  }
  let results: City[];
  try {
    results = await searchCity(name);
  } catch (error) {
    console.log(magenta(`\n  Error al buscar la ciudad: ${toMessage(error)}`));
    return;
  }
  if (results.length === 0) {
    console.log(`\n  No se encontró ninguna ciudad llamada "${name}".`);
    return;
  }
  const city =
    results.length === 1 ? results[0] : await pickCity(results, reader);
  if (!city) return;
  if (config.cities.some((saved) => saved.id === city.id)) {
    console.log(`\n  ${cityLabel(city)} ya está en la lista.`);
    return;
  }
  config.cities.push(city);
  await saveCities(config);
  console.log(blue(`\n  ${cityLabel(city)} agregada.`));
}
