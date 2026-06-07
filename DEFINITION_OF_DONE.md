# Definition of Done — strata-guard

Kontrolní seznam. Projekt je hotový, až když jsou splněny všechny položky.

## 1. `pnpm verify` z čistého checkoutu

**Ověření:** po `pnpm install --frozen-lockfile` spustit `pnpm verify`.

Musí projít: `type-check`, `lint`, `lint:names`, `lint:deps`, `check:fanout`, `test`.

**Stav:** _(doplní se ve fázi 4)_

## 2. Brány A–D blokují reálný `git commit`

**Ověření:** pro každou bránu zavést porušení, `git add` dotčené soubory, `git commit` musí selhat na pre-commit hooku. Důkaz v `SMOKE_TESTS.md`.

| Brána | Porušení | Očekávaná kontrola |
|-------|----------|-------------------|
| A | ui importuje repository | `lint:deps` → `ui-only-down` |
| B | špatné jméno souboru | `lint:names` |
| C | `process.env` mimo core (staged) | `lint-staged` / eslint `no-restricted-syntax` |
| D | hluboký import mezi vrstvami | `lint:deps` → `cross-layer-via-barrel` |

**Stav:** _(doplní se ve fázi 4)_

## 3. CI workflow `verify`

**Ověření:** push na GitHub spustí `.github/workflows/ci.yml` s `pnpm install --frozen-lockfile` a `pnpm verify`. V tomto prostředí GitHub Actions neběží — platí lokální ekvivalent: stejné příkazy jako v CI jobu `verify`.

**Stav:** _(doplní se ve fázi 4)_

## 4. Žádná nezdokumentovaná odchylka od plánu

**Ověření:** diff proti implementačnímu plánu je buď nulový, nebo každý rozdíl je v `DEVIATIONS.md` (co / proč).

**Stav:** _(doplní se ve fázi 4)_

## 5. Reprodukovatelnost závislostí

**Ověření:** `pnpm-lock.yaml` je v gitu; `pnpm install --frozen-lockfile` projde bez chyby.

**Stav:** _(doplní se ve fázi 4)_

## Vědomé rozhodnutí: pre-commit vs. CI

Pre-commit hook spouští: `lint-staged` (eslint na staged souborech), `lint:names`, `lint:deps`.

`pnpm verify` / CI navíc spouští: `type-check`, `check:fanout`, `test`.

**Důsledek:** commit může projít lokálně i s chybami typů nebo padajícími testy; CI je úplná brána. Záměr — rychlý lokální commit, plná kontrola až v CI.
