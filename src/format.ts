import { yellow } from "./colors.ts";
import type { City, Forecast, HourPoint, HourlyForecast, Weather } from "./types.ts";

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
  console.log(
    `  Temperatura: ${yellow(`${weather.temperature}${weather.temperatureUnit}`)}`,
  );
  console.log(
    `  Sensación:   ${yellow(`${weather.apparentTemperature}${weather.temperatureUnit}`)}`,
  );
  console.log(`  Humedad:     ${weather.humidity}${weather.humidityUnit}`);
  console.log(`  Viento:      ${weather.windSpeed} ${weather.windUnit}`);
  console.log(`  Observado:   ${moment}`);
}

const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

function shortDate(date: string): string {
  const parts = date.split("-");
  return `${parts[1] ?? ""}/${parts[2] ?? ""}`;
}

function dayLabel(date: string, isToday: boolean): string {
  const short = shortDate(date);
  if (isToday) return `hoy ${short}`;
  const weekday = WEEKDAYS[new Date(date).getUTCDay()] ?? "";
  return `${weekday} ${short}`;
}

export function printForecast(city: City, forecast: Forecast): void {
  const descriptions = forecast.days.map((day) =>
    describeWeather(day.weatherCode),
  );
  const width = Math.max(...descriptions.map((text) => text.length));
  console.log(`\n  ${cityLabel(city)}`);
  console.log(`  Pronóstico ${forecast.days.length} días\n`);
  forecast.days.forEach((day, index) => {
    const range = yellow(
      `${day.min}${forecast.temperatureUnit} – ${day.max}${forecast.temperatureUnit}`,
    );
    const description = (descriptions[index] ?? "").padEnd(width);
    const label = dayLabel(day.date, index === 0).padEnd(9);
    console.log(`  ${label} ${description}  ${range}`);
  });
}

export function printHourly(city: City, forecast: HourlyForecast): void {
  const today = forecast.currentHour.slice(0, 10);
  const byDay = new Map<string, HourPoint[]>();
  for (const point of forecast.hours) {
    const day = point.time.slice(0, 10);
    const group = byDay.get(day);
    if (group) group.push(point);
    else byDay.set(day, [point]);
  }
  const width = Math.max(
    ...forecast.hours.map((point) => describeWeather(point.weatherCode).length),
  );
  console.log(`\n  ${cityLabel(city)}`);
  console.log(`  Pronóstico por horas\n`);
  let first = true;
  for (const [day, points] of byDay) {
    if (!first) console.log("");
    first = false;
    console.log(`  ${dayLabel(day, day === today)}`);
    for (const point of points) {
      const isNow =
        point.time.slice(0, 13) === forecast.currentHour.slice(0, 13);
      const clock = `${(point.time.split("T")[1] ?? "").slice(0, 5)}${isNow ? " ahora" : ""}`.padEnd(11);
      const temperature = yellow(
        `${point.temperature}${forecast.temperatureUnit}`.padStart(9),
      );
      const description = describeWeather(point.weatherCode).padEnd(width);
      const rain = `lluvia ${String(point.precipitationProbability).padStart(3)}%`;
      console.log(`    ${clock}${temperature}  ${description}  ${rain}`);
    }
  }
}

export function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
