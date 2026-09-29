import type { City, Weather } from "./types.ts";

const WEATHER_CODES: Record<number, string> = {
  0: "Cielo despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna intensa",
  56: "Llovizna helada ligera",
  57: "Llovizna helada intensa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia intensa",
  66: "Lluvia helada ligera",
  67: "Lluvia helada intensa",
  71: "Nevada ligera",
  73: "Nevada moderada",
  75: "Nevada intensa",
  77: "Granos de nieve",
  80: "Chubascos ligeros",
  81: "Chubascos moderados",
  82: "Chubascos violentos",
  85: "Chubascos de nieve ligeros",
  86: "Chubascos de nieve intensos",
  95: "Tormenta",
  96: "Tormenta con granizo ligero",
  99: "Tormenta con granizo intenso",
};

export function describeWeather(code: number): string {
  return WEATHER_CODES[code] ?? `Condición desconocida (código ${code})`;
}

export function cityLabel(city: City): string {
  return [city.name, city.admin1, city.country].filter(Boolean).join(", ");
}

export function printWeather(city: City, weather: Weather): void {
  const moment = weather.time.replace("T", " ");
  console.log(`\n  ${cityLabel(city)}`);
  console.log(
    `  ${describeWeather(weather.weatherCode)}${weather.isDay ? "" : " · noche"}`,
  );
  console.log(`  Temperatura: ${weather.temperature}${weather.temperatureUnit}`);
  console.log(`  Sensación:   ${weather.apparentTemperature}${weather.temperatureUnit}`);
  console.log(`  Humedad:     ${weather.humidity}${weather.humidityUnit}`);
  console.log(`  Viento:      ${weather.windSpeed} ${weather.windUnit}`);
  console.log(`  Observado:   ${moment}`);
}

export function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
