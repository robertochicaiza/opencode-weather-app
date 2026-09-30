import { fetchForecast, fetchHourly, fetchWeather, searchCity } from "./api.ts";
import { green, red } from "./colors.ts";
import { saveConfig } from "./config.ts";
import {
  cityLabel,
  printForecast,
  printHourly,
  printWeather,
  toMessage,
} from "./format.ts";
import { listCities } from "./menu.ts";
import { ask, parseIndex } from "./reader.ts";
import type { LineReader } from "./reader.ts";
import type { City, Config, TemperatureUnit } from "./types.ts";

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
    console.log(red("\n  Opción no válida."));
    return undefined;
  }
  return candidates[index];
}

async function showCityWeather(
  city: City,
  unit: TemperatureUnit,
): Promise<void> {
  try {
    printWeather(city, await fetchWeather(city, unit));
  } catch (error) {
    console.log(`\n  ${cityLabel(city)}`);
    console.log(red(`  Error al obtener el clima: ${toMessage(error)}`));
  }
}

export async function showDefaultCity(config: Config): Promise<void> {
  const city = config.defaultCity;
  if (!city) {
    console.log("\n  No hay ciudad default. Usa la opción 5 para establecerla.");
    return;
  }
  await showCityWeather(city, config.settings.unit);
}

export async function showAllCities(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("\n  No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }
  const defaultCity = config.defaultCity;
  const ordered = defaultCity
    ? [defaultCity, ...config.cities.filter((city) => city.id !== defaultCity.id)]
    : config.cities;
  const unit = config.settings.unit;
  const results = await Promise.all(
    ordered.map((city) =>
      fetchWeather(city, unit).then(
        (weather) => ({ city, weather, error: null as string | null }),
        (error: unknown) => ({ city, weather: null, error: toMessage(error) }),
      ),
    ),
  );
  for (const result of results) {
    if (result.weather) printWeather(result.city, result.weather);
    else console.log(`\n  ${cityLabel(result.city)}\n  ${red(`Error: ${result.error}`)}`);
  }
}

async function selectCity(
  config: Config,
  reader: LineReader,
  prompt: string,
): Promise<City | undefined> {
  if (config.cities.length === 0) {
    console.log("\n  No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return undefined;
  }
  listCities(config);
  const answer = await ask(reader, prompt);
  if (answer === null) return undefined;
  const index = parseIndex(answer, config.cities.length);
  if (index === undefined) {
    console.log(red("\n  Opción no válida."));
    return undefined;
  }
  return config.cities[index];
}

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
    console.log(red(`  Error al obtener el pronóstico: ${toMessage(error)}`));
  }
}

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
      red(`  Error al obtener el pronóstico por horas: ${toMessage(error)}`),
    );
  }
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
    console.log(red(`\n  Error al buscar la ciudad: ${toMessage(error)}`));
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
  await saveConfig(config);
  console.log(green(`\n  ${cityLabel(city)} agregada.`));
}

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
    console.log(red("\n  Opción no válida."));
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
  await saveConfig(config);
  console.log(green(`\n  ${cityLabel(city)} eliminada.`));
}

export async function setDefaultCity(
  config: Config,
  reader: LineReader,
): Promise<void> {
  if (config.cities.length === 0) {
    console.log("\n  No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }
  listCities(config);
  const answer = await ask(reader, "  Número de ciudad default: ");
  if (answer === null) return;
  const index = parseIndex(answer, config.cities.length);
  if (index === undefined) {
    console.log(red("\n  Opción no válida."));
    return;
  }
  const city = config.cities[index];
  if (!city) return;
  config.defaultCity = city;
  await saveConfig(config);
  console.log(green(`\n  Ciudad default: ${cityLabel(city)}`));
}

export async function toggleUnit(config: Config): Promise<void> {
  config.settings.unit =
    config.settings.unit === "celsius" ? "fahrenheit" : "celsius";
  await saveConfig(config);
  const label =
    config.settings.unit === "fahrenheit" ? "°F (Fahrenheit)" : "°C (Celsius)";
  console.log(green(`\n  Unidad de temperatura: ${label}`));
}
