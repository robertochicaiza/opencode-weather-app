import { GEOCODING_URL } from "../utils/constants.ts";
import type { City } from "../types/City.ts";

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
