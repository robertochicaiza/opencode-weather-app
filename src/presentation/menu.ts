import { cyan } from "../utils/colors.ts";
import type { Config } from "../types/Config.ts";
import { println } from "../utils/print.ts";

export function showMenu(config: Config): void {
  const unit = config.settings.unit === "fahrenheit" ? "°F" : "°C";
  println(
    cyan(`
═══════════════════════════════════════
         WEATHER CLI
═══════════════════════════════════════
  1. Clima de ciudad default
  2. Clima de todas las ciudades (${config.cities.length})
  3. Buscar y agregar ciudad
  4. Eliminar ciudad
  5. Establecer ciudad default
  6. Pronóstico 5 días
  7. Pronóstico por horas
  8. Ajustes (${unit})
  9. Salir
═══════════════════════════════════════`),
  );
}
