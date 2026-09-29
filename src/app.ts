import { loadConfig } from "./config.ts";
import { showMenu } from "./menu.ts";
import {
  addCity,
  removeCity,
  setDefaultCity,
  showAllCities,
  showDefaultCity,
  toggleUnit,
} from "./options.ts";
import { ask, LineReader } from "./reader.ts";

export async function main(): Promise<void> {
  const config = await loadConfig();
  const reader = new LineReader(process.stdin, process.stdout);
  console.log("\n  Bienvenido a WEATHER CLI.");
  try {
    while (true) {
      showMenu(config);
      const choice = await ask(reader, "  Selecciona una opción: ");
      if (choice === null) {
        console.log("");
        return;
      }
      switch (choice) {
        case "1":
          await showDefaultCity(config);
          break;
        case "2":
          await showAllCities(config);
          break;
        case "3":
          await addCity(config, reader);
          break;
        case "4":
          await removeCity(config, reader);
          break;
        case "5":
          await setDefaultCity(config, reader);
          break;
        case "8":
          await toggleUnit(config);
          break;
        case "9":
          console.log("\n  ¡Hasta luego!\n");
          return;
        default:
          console.log("\n  Opción no válida.");
      }
    }
  } finally {
    reader.close();
  }
}
