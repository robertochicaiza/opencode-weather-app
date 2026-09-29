# AGENTS.md

## Layout

`index.ts` is a 3-line entrypoint (`import { main } from "./src/app.ts"; await main();`)
kept at the root so `package.json`'s `"module": "index.ts"` stays valid. Everything else
lives in `src/`, split by responsibility:

| File | Owns |
| --- | --- |
| `src/types.ts` | `City`, `Weather`, `Config`, `Settings`, `TemperatureUnit` (types only) |
| `src/config.ts` | `~/.weather-cli/config.json` load/save, defaults on corrupt input |
| `src/api.ts` | Open-Meteo `searchCity` / `fetchWeather` + the raw response shapes |
| `src/format.ts` | WMO code map, `cityLabel`, `printWeather`, `toMessage` |
| `src/reader.ts` | `LineReader`, `ask`, `parseIndex` (console input) |
| `src/menu.ts` | `showMenu`, `listCities` |
| `src/options.ts` | the eight menu handlers + `pickCity`, `showCityWeather` |
| `src/app.ts` | `main()` loop and the option `switch` |

`README.md` is the spec. Do **not** re-run `bun init` (the README's "Inicializar proyecto"
step is already done).

Note the layer direction: `options.ts` is the only module that orchestrates. `format.ts`,
`menu.ts`, and `reader.ts` know nothing about each other, and `types.ts` is types-only so
it is fully erased at build time (import it with `import type`).

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
- The README's mock menu is numbered `1,2,3,4,5,8,9` (settings and exit are high numbers).
  That's intentional — don't renumber.
- Open-Meteo is a two-step flow: geocode the city name, then call the forecast endpoint with
  the returned `latitude`/`longitude`. No API key or `.env` is involved.
- Geocoding is called with `count=5`, so a successful search almost always returns several
  matches and the numbered picker in option 3 is the *normal* path, not a rare edge case.
  A city that does not exist comes back with the `results` key **absent**, not empty — the
  guard is `data.results?.length`.
- Forecast requests use `timezone=auto`, so `current.time` is local to the city. Read the
  unit labels from `current_units` instead of hardcoding `°C`/`km/h`.
- Goal is a compiled executable, so prefer Bun-native APIs (`Bun.file`, `fetch`) over
  Node `fs`/polyfills.

## Repo hygiene

Single git commit (`2dcedcb`), `private: true`, nothing is published. `.env` files are
gitignored but unused so far.
