export type ForecastDay = {
  date: string;
  weatherCode: number;
  max: number;
  min: number;
};

export type Forecast = {
  days: ForecastDay[];
  temperatureUnit: string;
};
