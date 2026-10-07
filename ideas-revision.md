# Revisión Weather CLI

- [x] **Colores:** menú `cyan` (96), temperatura `yellow` (93), confirmaciones `blue` (94), errores `magenta` (95) — gama brillante 90-97.
- [x] **AGENTS.md:** actualizado con el nuevo layout (`actions/`, `presentation/`, `storage/`, `types/`, `api/`, `utils/` y `src/index.ts`).
- [] **Ciudades:** geocoding solo trae 1 resultado; nombres ambiguos pueden fallar.
- [] **Tests:** no existen; conviene al menos probar storage y las APIs con mocks.
- [] **Binario:** compila bien; revisar que `./weather` guarde datos en `~/.config/weather-cli/`.
- [] **Escalabilidad:** ¿qué tan fácil será expandir con nuevas funcionalidades?
- [] **Carga:** ¿hay estado de carga en las tareas asíncronas?