import { cityLabel } from "../utils/format.ts";
import type { Config } from "../types/Config.ts";

export function listCities(config: Config): void {
  console.log("\n  Ciudades guardadas:");
  config.cities.forEach((city, index) => {
    const marker = config.defaultCity?.id === city.id ? " (default)" : "";
    console.log(`   ${index + 1}. ${cityLabel(city)}${marker}`);
  });
}
