import type {
  City,
  Forecast,
  ForecastDay,
  HourPoint,
  HourlyForecast,
  TemperatureUnit,
  Weather,
} from "./types.ts";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const CURRENT_FIELDS =
  "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m";
const DAILY_FIELDS = "weather_code,temperature_2m_max,temperature_2m_min";
const FORECAST_DAYS = 5;
const HOURLY_FIELDS =
  "temperature_2m,weather_code,precipitation_probability";
const HOURLY_DAYS = 3;
const HOUR_STEP = 3;

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

type DailyResponse = {
  daily_units?: Record<string, string>;
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

type HourlyResponse = {
  current?: { time: string };
  hourly_units?: Record<string, string>;
  hourly?: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
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

export async function fetchForecast(
  city: City,
  unit: TemperatureUnit,
): Promise<Forecast> {
  const url = `${FORECAST_URL}?latitude=${city.latitude}&longitude=${city.longitude}&daily=${DAILY_FIELDS}&temperature_unit=${unit}&timezone=auto&forecast_days=${FORECAST_DAYS}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`el servicio del clima respondió ${response.status}`);
  }
  const data = (await response.json()) as DailyResponse;
  const daily = data.daily;
  if (!daily) throw new Error("la respuesta no trae pronóstico diario");
  const days: ForecastDay[] = [];
  daily.time.forEach((date, index) => {
    const max = daily.temperature_2m_max?.[index];
    const min = daily.temperature_2m_min?.[index];
    if (max === undefined || min === undefined) return;
    days.push({
      date,
      weatherCode: daily.weather_code?.[index] ?? 0,
      max,
      min,
    });
  });
  if (days.length === 0) throw new Error("la respuesta no trae pronóstico diario");
  const units = data.daily_units ?? {};
  return {
    days,
    temperatureUnit:
      units["temperature_2m_max"] ?? (unit === "fahrenheit" ? "°F" : "°C"),
  };
}

export async function fetchHourly(
  city: City,
  unit: TemperatureUnit,
): Promise<HourlyForecast> {
  const url = `${FORECAST_URL}?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m&hourly=${HOURLY_FIELDS}&temperature_unit=${unit}&timezone=auto&forecast_days=${HOURLY_DAYS}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`el servicio del clima respondió ${response.status}`);
  }
  const data = (await response.json()) as HourlyResponse;
  const hourly = data.hourly;
  if (!hourly?.time) throw new Error("la respuesta no trae pronóstico por horas");
  const currentHour = data.current?.time ?? "";
  const from = currentHour.slice(0, 13);
  const points: HourPoint[] = [];
  hourly.time.forEach((time, index) => {
    if (from && time.slice(0, 13) < from) return;
    const temperature = hourly.temperature_2m?.[index];
    if (temperature === undefined) return;
    points.push({
      time,
      temperature,
      weatherCode: hourly.weather_code?.[index] ?? 0,
      precipitationProbability:
        hourly.precipitation_probability?.[index] ?? 0,
    });
  });
  const hours = points.filter((_, index) => index % HOUR_STEP === 0);
  if (hours.length === 0) throw new Error("la respuesta no trae pronóstico por horas");
  const units = data.hourly_units ?? {};
  return {
    hours,
    currentHour,
    temperatureUnit:
      units["temperature_2m"] ?? (unit === "fahrenheit" ? "°F" : "°C"),
  };
}
