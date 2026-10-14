import { yellow } from "../utils/colors.ts";
import { cityLabel, dayLabel, describeWeather } from "../utils/format.ts";
import type { City } from "../types/City.ts";
import type { Forecast } from "../types/Forecast.ts";
import type { HourPoint, HourlyForecast } from "../types/HourlyForecast.ts";
import type { Weather } from "../types/Weather.ts";
import { println } from "../utils/print.ts";

export function printWeather(city: City, weather: Weather): void {
  const moment = weather.time.replace("T", " ");
  println(`\n  ${cityLabel(city)}`);
  println(
    `  ${describeWeather(weather.weatherCode)}${weather.isDay ? "" : " · noche"}`,
  );
  println(
    `  Temperatura: ${yellow(`${weather.temperature}${weather.temperatureUnit}`)}`,
  );
  println(
    `  Sensación:   ${yellow(`${weather.apparentTemperature}${weather.temperatureUnit}`)}`,
  );
  println(`  Humedad:     ${weather.humidity}${weather.humidityUnit}`);
  println(`  Viento:      ${weather.windSpeed} ${weather.windUnit}`);
  println(`  Observado:   ${moment}`);
}

export function printForecast(city: City, forecast: Forecast): void {
  const descriptions = forecast.days.map((day) =>
    describeWeather(day.weatherCode),
  );
  const width = Math.max(...descriptions.map((text) => text.length));
  println(`\n  ${cityLabel(city)}`);
  println(`  Pronóstico ${forecast.days.length} días\n`);
  forecast.days.forEach((day, index) => {
    const range = yellow(
      `${day.min}${forecast.temperatureUnit} – ${day.max}${forecast.temperatureUnit}`,
    );
    const description = (descriptions[index] ?? "").padEnd(width);
    const label = dayLabel(day.date, index === 0).padEnd(9);
    println(`  ${label} ${description}  ${range}`);
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
  println(`\n  ${cityLabel(city)}`);
  println(`  Pronóstico por horas\n`);
  let first = true;
  for (const [day, points] of byDay) {
    if (!first) println("");
    first = false;
    println(`  ${dayLabel(day, day === today)}`);
    for (const point of points) {
      const isNow =
        point.time.slice(0, 13) === forecast.currentHour.slice(0, 13);
      const clock = `${(point.time.split("T")[1] ?? "").slice(0, 5)}${isNow ? " ahora" : ""}`.padEnd(11);
      const temperature = yellow(
        `${point.temperature}${forecast.temperatureUnit}`.padStart(9),
      );
      const description = describeWeather(point.weatherCode).padEnd(width);
      const rain = `lluvia ${String(point.precipitationProbability).padStart(3)}%`;
      println(`    ${clock}${temperature}  ${description}  ${rain}`);
    }
  }
}
