import { cityLabel } from "./format.ts";
import type { Config } from "./types.ts";

export function showMenu(config: Config): void {
  const unit = config.settings.unit === "fahrenheit" ? "°F" : "°C";
  console.log(`
═══════════════════════════════════════
         WEATHER CLI
═══════════════════════════════════════
  1. Clima de ciudad default
  2. Clima de todas las ciudades (${config.cities.length})
  3. Buscar y agregar ciudad
  4. Eliminar ciudad
  5. Establecer ciudad default
  8. Ajustes (${unit})
  9. Salir
═══════════════════════════════════════`);
}

export function listCities(config: Config): void {
  console.log("\n  Ciudades guardadas:");
  config.cities.forEach((city, index) => {
    const marker = config.defaultCity?.id === city.id ? " (default)" : "";
    console.log(`   ${index + 1}. ${cityLabel(city)}${marker}`);
  });
}
