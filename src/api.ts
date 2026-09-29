import type { City, TemperatureUnit, Weather } from "./types.ts";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const CURRENT_FIELDS =
  "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m";

type GeocodingResponse = {
  results?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
    timezone?: string;
  }[];
};

type ForecastResponse = {
  current_units?: Record<string, string>;
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
  };
};

export async function searchCity(name: string): Promise<City[]> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=5&language=es&format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`el servicio de búsqueda respondió ${response.status}`);
  }
  const data = (await response.json()) as GeocodingResponse;
  return (data.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country ?? "",
    admin1: result.admin1 ?? "",
    timezone: result.timezone ?? "",
  }));
}

export async function fetchWeather(
  city: City,
  unit: TemperatureUnit,
): Promise<Weather> {
  const url = `${FORECAST_URL}?latitude=${city.latitude}&longitude=${city.longitude}&current=${CURRENT_FIELDS}&temperature_unit=${unit}&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`el servicio del clima respondió ${response.status}`);
  }
  const data = (await response.json()) as ForecastResponse;
  const current = data.current;
  if (!current) throw new Error("la respuesta no trae condiciones actuales");
  const units = data.current_units ?? {};
  return {
    time: current.time,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    weatherCode: current.weather_code,
    isDay: current.is_day === 1,
    temperatureUnit: units["temperature_2m"] ?? (unit === "fahrenheit" ? "°F" : "°C"),
    humidityUnit: units["relative_humidity_2m"] ?? "%",
    windUnit: units["wind_speed_10m"] ?? "km/h",
  };
}
