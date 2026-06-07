# Odchylky od implementačního plánu

Každý záměrný rozdíl oproti plánu je zde zdokumentován.

## Nástrojové úpravy (nutná reakce na verze)

### `tsconfig.json` — `jsx` a `ignoreDeprecations`

| | |
|---|---|
| **Čeho se týká** | `compilerOptions` v `tsconfig.json` |
| **Co je jinak** | Přidáno `"jsx": "react-jsx"` a `"ignoreDeprecations": "6.0"` |
| **Proč plán nemohl předvídat** | Plán předpokládal `.tsx` v `ui/`; TypeScript 6.0 zároveň deprecuje `baseUrl` bez kterého alias `@/*` nefunguje. Obojí vyžaduje explicitní volbu na nainstalovaných verzích (TS 6.0.3). |

### `eslint.config.mjs` — rozšířené `ignores`

| | |
|---|---|
| **Čeho se týká** | `ignores` v `eslint.config.mjs` |
| **Co je jinak** | Navíc `scripts` a `.dependency-cruiser.cjs` |
| **Proč plán nemohl předvídat** | ESLint 10 s flat config lintuje `eslint .` včetně root skriptů; plán definuje pravidla jen pro `src/**`, ale příkaz `lint` pokrývá celý repozitář. Bez ignore padá na `module`/`process` v CommonJS/Node souborech. |

## Záměrné doplnění mimo plán

### `packageManager` — corepack pinning

| | |
|---|---|
| **Čeho se týká** | pole `packageManager` v `package.json` |
| **Co je jinak** | `pnpm@11.5.2+sha512:…` místo `pnpm@latest` z plánu |
| **Proč** | `corepack use pnpm@latest` zapíše přesnou verzi s hashem — správné chování pro reprodukovatelnost a CI (`pnpm/action-setup` čte tento field). |

### `.gitignore`

| | |
|---|---|
| **Čeho se týká** | soubor `.gitignore` (v plánu chybí) |
| **Co je jinak** | Ignoruje `node_modules/`, `dist/`, `coverage/` |
| **Proč** | `git add -A` bez `.gitignore` by mohlo zaindexovat `node_modules/`; plán předpokládá lockfile v gitu, ne vendor tree. |

### `required()` v `src/core/config.ts`

| | |
|---|---|
| **Čeho se týká** | export `required` z `config.ts` |
| **Rozhodnutí** | Funkce **odstraněna** — zůstávají jen defaulty přes `??`. |
| **Proč** | Použití `required('DATABASE_URL')` by zrušilo záměrný fallback `memory://local` z plánu; mrtvý export bez barrel re-exportu nemá hodnotu. |

## Větev gitu

| | |
|---|---|
| **Čeho se týká** | výchozí větev |
| **Co je jinak** | `main` místo `master` z `git init` |
| **Proč** | Konvence repozitáře; přejmenováno ve fázi 1. |

## Co plán neřeší (záměrně beze změny)

### Druhý commit „lock dependencies“

Plán navrhoval samostatný commit pro `pnpm-lock.yaml`; lockfile skončil už v prvním scaffold commitu. Funkčně splněno, historie gitu se liší.

### `money.vo.ts` nepoužitý

Ukázkový domain soubor z plánu; orphan warning od depcruise je `warn`, ne gate.

### Pre-commit vs. CI — mezera typů a testů

Zdokumentováno v `DEFINITION_OF_DONE.md` jako vědomé rozhodnutí.

### `UserPage` — z `.tsx` na `.ts`

| | |
|---|---|
| **Čeho se týká** | `src/ui/UserPage.tsx` z plánu |
| **Co je jinak** | Soubor je `UserPage.ts`; `.ls-lint.yml` pro `src/ui` povoluje `PascalCase` u `.ts` místo `.tsx` |
| **Proč** | Prototyp bez UI runtime nemá React; `.tsx` + `jsx: react-jsx` bez JSX a bez `@types/react` bylo křehké. |

### Brána C — nestaged `process.env` (díra v pre-commit)

| | |
|---|---|
| **Čeho se týká** | pre-commit hook vs. eslint na celém repu |
| **Co se stalo** | Nestaged `process.env` mimo `core` commit **neblokuje** — viz `SMOKE_TESTS.md` sekce C-unstaged |
| **Proč plán nemohl předvídat** | Plán definuje `lint-staged` jen na staged souborech; plná kontrola `process.env` je v `pnpm lint` / CI, ne v hooku pro nestaged změny. |
