# Strata-guard — kontext

Pravidla vynucují nástroje, ne paměť. Při nejistotě spusť `pnpm verify`.

## Brány

| Kdy | Co běží |
|-----|---------|
| **pre-commit** | `lint-staged` (eslint autofix na staged), `lint:env` (eslint celý `src/` — `process.env` jen v `core`), `lint:names`, `lint:deps` |
| **`pnpm verify` / CI** | navíc `type-check`, `check:fanout` (WARN), `test` |

Commit může projít bez typů a testů; CI (`verify`) je úplná brána. Strukturální porušení (vrstvy, jména, env) commit zablokuje vždy — i nestaged díky `lint:env`.

## Vrstvy (import jen jednosměrně dolů)

`ui` → `api` → `service` → `repository` → (DB). `domain` a `core` jsou sdílené; neimportují vrstvy.

Mezi vrstvami importuj **jen** přes barrel `@/<vrstva>` (soubor `index.ts`), nikdy přímo pod-soubor jiné vrstvy.

## Konvence jmen

| Vrstva | Vzor | Příklad |
|--------|------|---------|
| domain | `*.entity.ts`, `*.vo.ts`, `*.types.ts` | `user.entity.ts` |
| repository | `*.repository.ts` | `user.repository.ts` |
| service | `*.service.ts` | `user.service.ts` |
| api | `*.route.ts` | `user.route.ts` |
| ui | `PascalCase.ts` | `UserPage.ts` |
| core | kebab-case `.ts` | `config.ts` |
| test | `<zdroj>.test.ts` u zdroje | `user.service.test.ts` |

Konfigurace (`process.env`) jen v `src/core/config.ts`; jinde čti přes `@/core`.

## Když přidáváš featuru

1. **domain** — entity, VO, typy (čisté, bez importů z app vrstev)
2. **repository** — přístup k datům (importuje `@/domain`, `@/core`)
3. **service** — business logika (importuje `@/repository`, `@/domain`, `@/core`)
4. **api** — route handlery (importuje `@/service`, `@/domain`, `@/core`)
5. **ui** — prezentace (importuje `@/api`, `@/domain`, `@/core`)

Každá vrstva: soubor + `index.ts` barrel. Cross-layer import vždy `@/<vrstva>`, ne `@/service/foo.service.js`.

Po dokončení: `pnpm verify`.

## Slovník pojmů

- **user** = přihlášený člověk; nepoužívej account ani customer pro totéž.

## Hlášení

- **error (GATE):** oprav hned; commit ani CI to nepustí.
- **WARN** (fan-out/exporty v `check:fanout`): soubor je zralý na rozdělení.

## Co se nehlídá automaticky

Refaktor nemění chování — drž testy na hranicích vrstev (import přes `@/<vrstva>`).
