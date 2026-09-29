export type TemperatureUnit = "celsius" | "fahrenheit";

export type City = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1: string;
  timezone: string;
};

export type Settings = {
  unit: TemperatureUnit;
};

export type Config = {
  defaultCity: City | null;
  cities: City[];
  settings: Settings;
};

export type Weather = {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  temperatureUnit: string;
  humidityUnit: string;
  windUnit: string;
};
