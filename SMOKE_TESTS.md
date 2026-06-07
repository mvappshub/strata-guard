# Smoke testy — brány A–D přes reálný `git commit`

Provedeno na větvi `main`. Po každém testu working tree obnoven; `pnpm verify` zelené.

## A — porušení vrstvy (ui → repository)

**Změna:** `src/ui/UserPage.tsx` — import `@/repository` + `void findUser(id)`.

**Příkaz:** `git add src/ui/UserPage.tsx && git commit -m "smoke: gate A"`

**Výsledek:** commit **selhal** (exit 1).

**Která kontrola:** `pnpm lint:deps` → `ui-only-down`

```
$ depcruise src
  error ui-only-down: src/ui/UserPage.tsx → src/repository/index.ts
husky - pre-commit script failed (code 1)
```

---

## B — špatné jméno souboru

**Změna:** přejmenování `user.service.ts` → `user.ts`, `git add -A`.

**Příkaz:** `git commit -m "smoke: gate B"`

**Výsledek:** commit **selhal** (exit 1).

**Která kontrola:** `pnpm lint:names`

```
$ ls-lint
src/service/user.ts failed for `.ts` rules: regex:[a-z0-9-]+\.service | regex:index
husky - pre-commit script failed (code 1)
```

---

## C — `process.env` mimo core

### C-staged (staged soubor)

**Změna:** `const _smoke = process.env.FOO` v `src/api/user.route.ts`, soubor staged.

**Příkaz:** `git add src/api/user.route.ts && git commit -m "smoke: gate C staged"`

**Výsledek:** commit **selhal** (exit 1).

**Která kontrola:** `lint-staged` → eslint `no-restricted-syntax`

```
✖ eslint --fix:
/home/martin/Desktop/satra/strata-guard/src/api/user.route.ts
  3:16  error  process.env je povolen jen v src/core/config.ts — konfiguraci čti přes @/core  no-restricted-syntax
husky - pre-commit script failed (code 1)
```

### C-unstaged (nestaged soubor) — historie (fáze 2, před fixem)

**Výsledek:** commit **prošel** (exit 0) — díra; artefakt `e6059c8` v historii.

**Příčina:** bez `lint:env` na celém stromu hook nestaged `process.env` neviděl.

### C — po fixu fáze 5 (`pnpm lint:env` v pre-commit)

#### C-staged v2

**Změna:** `const _smoke = process.env.FOO` v `src/api/user.route.ts`, soubor staged.

**Příkaz:** `git add src/api/user.route.ts && git commit -m "smoke: gate C staged v2"`

**Výsledek:** commit **selhal** (exit 1).

**Která kontrola:** `lint-staged` → eslint `no-restricted-syntax` (dříve než `lint:env`)

```
✖ eslint --fix:
/home/martin/Desktop/satra/strata-guard/src/api/user.route.ts
  3:16  error  process.env je povolen jen v src/core/config.ts — konfiguraci čti přes @/core  no-restricted-syntax
husky - pre-commit script failed (code 1)
```

#### C-unstaged v2

**Změna:** stejné porušení, soubor **není** staged (`git restore --staged`).

**Příkaz:** `git commit --allow-empty -m "smoke: gate C unstaged v2"`

**Výsledek:** commit **selhal** (exit 1).

**Která kontrola:** `pnpm lint:env` → eslint na celém `src/`

```
→ lint-staged could not find any staged files.
$ eslint src
/home/martin/Desktop/satra/strata-guard/src/api/user.route.ts
  3:16  error  process.env je povolen jen v src/core/config.ts — konfiguraci čti přes @/core  no-restricted-syntax
husky - pre-commit script failed (code 1)
```

---

## D — hluboký import mezi vrstvami

**Změna:** `import { findUser } from '@/repository/user.repository.js'` v `src/api/user.route.ts`, staged.

**Příkaz:** `git add src/api/user.route.ts && git commit -m "smoke: gate D"`

**Výsledek:** commit **selhal** (exit 2).

**Která kontrola:** `pnpm lint:deps` → `cross-layer-via-barrel` (+ `api-only-down`)

```
$ depcruise src
  error cross-layer-via-barrel: src/api/user.route.ts → src/repository/user.repository.ts
  error api-only-down: src/api/user.route.ts → src/repository/user.repository.ts
husky - pre-commit script failed (code 2)
```
