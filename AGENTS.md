# AGENTS.md

## Layout

`index.ts` is a 3-line entrypoint (`import { main } from "./src/app.ts"; await main();`)
kept at the root so `package.json`'s `"module": "index.ts"` stays valid. Everything else
lives in `src/`, split by responsibility:

| File | Owns |
| --- | --- |
| `src/types.ts` | `City`, `Weather`, `Forecast`, `ForecastDay`, `HourPoint`, `HourlyForecast`, `Config`, `Settings`, `TemperatureUnit` (types only) |
| `src/colors.ts` | `cyan`, `yellow`, `blue`, `magenta` (ANSI, sin dependencias) |
| `src/config.ts` | `~/.weather-cli/config.json` load/save, defaults on corrupt input |
| `src/api.ts` | Open-Meteo `searchCity` / `fetchWeather` / `fetchForecast` / `fetchHourly` + the raw response shapes |
| `src/format.ts` | WMO code map, `cityLabel`, `printWeather`, `printForecast`, `printHourly`, `toMessage` |
| `src/reader.ts` | `LineReader`, `ask`, `parseIndex` (console input) |
| `src/menu.ts` | `showMenu`, `listCities` |
| `src/options.ts` | the ten menu handlers + `pickCity`, `selectCity`, `showCityWeather` |
| `src/app.ts` | `main()` loop and the option `switch` |

`README.md` is the spec. Do **not** re-run `bun init` (the README's "Inicializar proyecto"
step is already done).

Note the layer direction: `options.ts` is the only module that orchestrates. `format.ts`,
`menu.ts`, and `reader.ts` know nothing about each other, and `types.ts` is types-only so
it is fully erased at build time (import it with `import type`).

`colors.ts` is a leaf: it imports nothing from the project, so any module may use it
without creating a cycle. Reach for it instead of inlining `\x1b[..m` in a template literal.

## Build

```
bun run index.ts                    # dev
bun build --compile index.ts --outfile dist/weather-cli.exe   # standalone binary
```

`dist/` is already gitignored, which is why the binary goes there. The compiled binary
must be runnable from any directory, so config is **not** cwd-relative.

## Config storage

State lives at `~/.weather-cli/config.json` (`homedir()` from `node:os` + `join`), not in
the project. Shape: `{ defaultCity, cities[], settings: { unit } }`. Loaded defensively —
missing file, malformed JSON, or a hand-edited file all fall back to defaults instead of
crashing. `Bun.write` creates missing parent directories, so no `mkdir` is needed.

## Gotcha that cost real debugging time

Do **not** call `rl.question()` in a loop from `node:readline/promises`. Repeated calls
silently drop input that was already buffered, so piped input stalls forever after the
first line. `src/reader.ts` uses a `LineReader` class instead: one persistent `"line"`
listener that pushes into a queue, plus a `"close"` listener that resolves pending reads
with `null` so EOF ends the app instead of spinning on empty input.

To smoke-test non-interactively, redirect a file into stdin (`cmd /c "bun run index.ts <
session.txt"`) — piping through PowerShell's `Get-Content` mangles the stream and hangs.


## Commands

There is **no `scripts` block** in `package.json`, so `bun run <script>` does not work.
Run these directly:

| Task | Command |
| --- | --- |
| Run | `bun run index.ts` |
| Typecheck | `bunx tsc --noEmit` |
| Test | `bun test` (currently 0 test files) |

- Use `bun` for everything — `bun.lock` is the only lockfile. Don't run `npm`/`yarn`
  install; it will create a competing lockfile.
- `npx tsc` **fails** here: npx resolves the unrelated `tsc` package from the registry
  instead of the local binary. Always go through `bunx`.
- `typescript` is a `peerDependency` (`^7`, locked to 7.0.2 — the native port), not a
  `devDependency`. It is already in `node_modules`, so `bunx tsc` works out of the box.
  Don't "fix" this by adding typescript 5.x; `bun-types` ships a `ts7.1` variant matched
  to this compiler.

## Constraints that bite

From `tsconfig.json` (`noEmit`, `noUnusedLocals: false`, etc.):

- `verbatimModuleSyntax: true` — every type-only import must be `import type { X } from ...`.
  Value imports of types will fail typecheck.
- `allowImportingTsExtensions: true` — relative imports should keep the `.ts` extension
  (`./menu.ts`, not `./menu`). Bun resolves it; the `moduleResolution: "bundler"` setup
  requires it.
- `noUncheckedIndexedAccess: true` — `arr[0]` and `obj[key]` are `T | undefined`. Array and
  record lookups need an explicit guard, including after known-safe `while` loops.
- `noEmit: true` — there is no compile step for typecheck purposes. The standalone binary
  comes from `bun build --compile`, per the README.

## Conventions

- README is written in Spanish, and the target UI is a Spanish-language console menu. Keep
  user-facing strings and prompts in Spanish; code identifiers in English.
- The README's mock menu is numbered `1,2,3,4,5,6,7,8,9` (settings and exit are high numbers).
  That's intentional — don't renumber.
- Open-Meteo is a two-step flow: geocode the city name, then call the forecast endpoint with
  the returned `latitude`/`longitude`. No API key or `.env` is involved.
- Geocoding is called with `count=5`, so a successful search almost always returns several
  matches and the numbered picker in option 3 is the *normal* path, not a rare edge case.
  A city that does not exist comes back with the `results` key **absent**, not empty — the
  guard is `data.results?.length`.
- Forecast requests use `timezone=auto`, so `current.time` is local to the city. Read the
  unit labels from `current_units` instead of hardcoding `°C`/`km/h`.
- The daily endpoint is the same `FORECAST_URL` with `daily=...&forecast_days=5`; its unit
  label lives in `daily_units["temperature_2m_max"]`. The three `daily.*` arrays are parallel,
  so a day is skipped when its max/min is missing rather than filled with a placeholder.
- `daily.time` entries are bare `YYYY-MM-DD` strings. Parse them with `getUTCDay()`, never
  `getDay()` — local parsing in a negative offset (Ottawa is UTC-4) shifts the label back one
  day. `daily[0]` is always today in the city's timezone, so `printForecast` labels it `hoy`.
- The hourly endpoint is the same `FORECAST_URL` with `hourly=...&forecast_days=3`, and it
  needs `current=...` **in the same request** to know what "ahora" is. `current=time` is not
  a valid variable (400), so ask for a real one and read `current.time`.
- `hourly.time` entries are `YYYY-MM-DDTHH:MM` in the city's timezone. `current.time` is
  rounded to a 15-minute interval, so compare hours by the `slice(0, 13)` prefix
  (`"2026-09-29T16"`), never by full-string equality. Strings compare correctly because the
  format is fixed-width and zero-padded, which is also why no `Date` is needed here.
- `fetchHourly` owns the business rules so `printHourly` stays a printer: drop past hours,
  keep every 3rd one (`HOUR_STEP`) so blocks are anchored on "ahora", and throw if nothing
  is left. If `current` is missing it degrades to the full day from 00:00.
- `options.ts` has two city pickers and they must stay in sync: `pickCity` searches the
  geocoder results, `selectCity` picks from `config.cities`. Options 6 and 7 share
  `selectCity`, passing only the prompt text.
- Goal is a compiled executable, so prefer Bun-native APIs (`Bun.file`, `fetch`) over
  Node `fs`/polyfills.
- Palette is fixed: `cyan` (96) for the menu, `yellow` (93) for temperature values, `blue` (94)
  for confirmations, `magenta` (95) for errors. Purely informational messages stay uncolored.
  Don't add bold/dim or new hues.
- Helpers are named after the tone they paint, not their role — the tone is the only thing
  that lives in `colors.ts`, so repainting the app means editing four numbers there and
  nothing else. Don't inline a raw `\x1b[..m` at a call site to "just try" a color.
- The palette uses the **bright** ANSI range 90-97 on purpose. The 30-37 range gets
  overridden by the terminal theme (Windows Terminal in particular), and `33` renders as a
  washed-out yellow that is hard to read in the dense temperature column.
- `colors.ts` self-disables when `NO_COLOR` is set or `process.stdout.isTTY` is falsy, so
  the redirected smoke tests emit plain text. Never wrap a `cityLabel(...)` alone — paint
  the whole sentence.

## Repo hygiene

Single git commit (`2dcedcb`), `private: true`, nothing is published. `.env` files are
gitignored but unused so far.
