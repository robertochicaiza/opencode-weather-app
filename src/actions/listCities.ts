import { cityLabel } from "../utils/format.ts";
import type { Config } from "../types/Config.ts";
import { println } from "../utils/print.ts";

export function listCities(config: Config): void {
  println("\n  Ciudades guardadas:");
  config.cities.forEach((city, index) => {
    const marker = config.defaultCity?.id === city.id ? " (default)" : "";
    println(`   ${index + 1}. ${cityLabel(city)}${marker}`);
  });
}
