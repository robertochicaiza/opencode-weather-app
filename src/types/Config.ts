import type { City } from "./City.ts";
import type { TemperatureUnit } from "./TemperatureUnit.ts";

export type Settings = {
  unit: TemperatureUnit;
};

export type Config = {
  defaultCity: City | null;
  cities: City[];
  settings: Settings;
};
