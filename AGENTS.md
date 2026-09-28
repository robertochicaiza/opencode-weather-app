# AGENTS.md

## Project state

Greenfield. The only source file is `index.ts` (a one-line stub). Everything else is the
untouched `bun init` template: `package.json`, `tsconfig.json`, `bun.lock`, `.gitignore`.
`README.md` is the spec — read it before designing anything. Do **not** re-run `bun init`
(the README's "Inicializar proyecto" step is already done).

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
- Goal is a compiled executable, so prefer Bun-native APIs (`Bun.file`, `fetch`) over
  Node `fs`/polyfills.

## Repo hygiene

Single git commit (`2dcedcb`), `private: true`, nothing is published. `.env` files are
gitignored but unused so far.
