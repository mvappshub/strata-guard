# Strata-guard — kontext

Pravidla vynucují nástroje (eslint, ls-lint, dependency-cruiser, husky, CI).
Při nejistotě spusť `pnpm verify`.

## Vrstvy (import jen jednosměrně dolů)
ui -> api -> service -> repository -> (DB). domain a core smí importovat každý; samy
neimportují vrstvy. Mezi vrstvami se importuje jen přes `@/<vrstva>` (barrel index.ts).

## Konvence jmen
*.entity.ts/*.vo.ts = domain; *.repository.ts = repository; *.service.ts = service;
*.route.ts = api; PascalCase.tsx = ui; konfigurace přes @/core. Test = <zdroj>.test.ts.

## Slovník pojmů (jeden název pro jeden koncept)
- "user" = přihlášený člověk; nepoužívej account ani customer pro totéž.
- (doplňuj, jak projekt roste)

## Hlášení
- error (GATE): oprav hned; commit ani CI to nepustí.
- WARN (fan-out/exporty): soubor je zralý na rozdělení.

## Co se nehlídá automaticky
- že refaktor nezměnil chování -> drž a přidávej testy na hranicích vrstev.
