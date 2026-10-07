import { fetchWeather } from "../api/weather.ts";
import { magenta } from "../utils/colors.ts";
import { printWeather } from "../presentation/output.ts";
import { cityLabel, toMessage } from "../utils/format.ts";
import type { City } from "../types/City.ts";
import type { Config } from "../types/Config.ts";
import type { TemperatureUnit } from "../types/TemperatureUnit.ts";

async function showCityWeather(
  city: City,
  unit: TemperatureUnit,
): Promise<void> {
  try {
    printWeather(city, await fetchWeather(city, unit));
  } catch (error) {
    console.log(`\n  ${cityLabel(city)}`);
    console.log(magenta(`  Error al obtener el clima: ${toMessage(error)}`));
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
    else console.log(`\n  ${cityLabel(result.city)}\n  ${magenta(`Error: ${result.error}`)}`);
  }
}
