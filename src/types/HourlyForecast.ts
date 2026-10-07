export type HourPoint = {
  time: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
};

export type HourlyForecast = {
  hours: HourPoint[];
  currentHour: string;
  temperatureUnit: string;
};
