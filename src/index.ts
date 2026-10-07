import { addCity } from "./actions/addCity.ts";
import { removeCity } from "./actions/removeCity.ts";
import { setDefaultCity } from "./actions/setDefaultCity.ts";
import { showAllCities, showDefaultCity } from "./actions/getWeather.ts";
import { showForecast } from "./actions/getForecast.ts";
import { showHourly } from "./actions/getHourly.ts";
import { toggleUnit } from "./actions/toggleUnit.ts";
import { showMenu } from "./presentation/menu.ts";
import { ask, isMenuOption, LineReader } from "./presentation/input.ts";
import { loadCities } from "./storage/citiesStorage.ts";
import { loadSettings } from "./storage/settingsStorage.ts";
import { magenta } from "./utils/colors.ts";
import type { Config } from "./types/Config.ts";

async function main(): Promise<void> {
  const config: Config = {
    ...(await loadCities()),
    settings: await loadSettings(),
  };
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
      if (!isMenuOption(choice)) {
        console.log(magenta("\n  Opción no válida."));
        continue;
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
        case "6":
          await showForecast(config, reader);
          break;
        case "7":
          await showHourly(config, reader);
          break;
        case "8":
          await toggleUnit(config);
          break;
        case "9":
          console.log("\n  ¡Hasta luego!\n");
          return;
      }
    }
  } finally {
    reader.close();
  }
}

await main();
