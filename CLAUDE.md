# FamSync — project guide for Claude (and humans)

FamSync is a cross-platform (iOS + Android, web for free) **family calendar** app: create calendars,
add events, and share them with family members. It is built **local-first** so it works offline, with
**sharing/sync defined behind an interface** so the real backend can be chosen later without rewrites.
Future features (e.g. shared tracking/lists) must slot in as *additive* modules — never by coupling the
existing calendar to a specific backend or screen.

> This file is the **advisory** layer (principles + conventions). Things that *must* hold are
> **enforced** in `.claude/settings.json` (permissions, the `SessionStart` hook). See
> [docs/architecture.md](docs/architecture.md) for the full picture.

---

## The one rule that keeps this app robust and scalable: the dependency rule

Dependencies point **inward only**:

```
presentation ─▶ application ─▶ domain
infrastructure ─▶ application/domain   (implements the ports)
                 (nothing points back out)
```

- **`src/domain`** — pure business model (entities, value objects, invariants). **No** imports from
  React, React Native, Expo, or any adapter. Fully unit-testable with no device.
- **`src/application`** — use-cases plus **ports** (interfaces like `CalendarRepository`,
  `EventRepository`, `SyncService`, `Clock`, `IdGenerator`). Depends only on the domain.
- **`src/infrastructure`** — adapters that *implement* the ports (in-memory store, local-only sync,
  system clock). The only layer that knows about concrete tech. Wired in `infrastructure/container.ts`.
- **`src/presentation`** — React Native UI. Talks to use-cases through the `ServicesProvider` /
  `AppDataProvider`; **never** imports an adapter or reaches into the domain's internals directly.
- **`src/app`** — Expo Router routes; thin files that render a presentation screen.

**Why this matters for the brief:** the family-sharing backend is a single seam (`SyncService`). Today a
local-only stub implements it; swapping in Supabase / Firebase / a CRDT engine is a change to *one
adapter + one line in the container* — the domain, use-cases, and every screen stay untouched. That is
how we avoid locking the app's usability into a tight dependency.

---

## Principles for building robustly & at scale (apply these by default)

1. **Depend on interfaces, not implementations.** New external capability ⇒ define a port in
   `application/ports`, implement it in `infrastructure`, wire it in the container. Never `import` an
   SDK from the domain, a use-case, or a screen.
2. **Keep the domain pure and tested.** Construct entities only through their factories
   (`createCalendarEvent`, `createCalendar`) so invariants hold everywhere. Write the test first.
3. **Type strictly.** `strict` is on. No `any`; prefer precise types and branded IDs (`CalendarId`,
   `EventId`) so values can't be mixed up. `?` optionals are fine (this is TypeScript, not C#).
4. **Immutability by default.** Entities are `readonly`; "mutations" return new values
   (`withMember`). Easier to reason about and to sync later.
5. **Features are modular and additive.** A new feature lives under its own folder
   (`presentation/features/<name>`, plus domain/use-cases as needed) and is added *alongside* existing
   ones. Adding "tracking" later must not require editing calendar code.
6. **Local-first.** The app must remain fully usable offline. Sync is an enhancement layered on top,
   never a prerequisite for core flows.
7. **Inject side-effects.** Time (`Clock`), ids (`IdGenerator`), storage, and sync are injected — never
   call `new Date()` / `Math.random()` inside use-cases. This keeps logic deterministic and testable.
8. **Small, verifiable changes.** End every change with a check you can run: `npm run typecheck` and
   `npm test`. Don't claim success without showing them green.
9. **One type per file**, named after the type. Extract repeated literals into named constants.
10. **Don't add a dependency to dodge an abstraction.** Prefer a port + a tiny adapter over scattering a
    library through the codebase.

---

## Project layout

```
src/
  domain/           pure model — entities, value objects, invariants (no framework imports)
  application/
    ports/          interfaces the app depends on (the swappable seams)
    usecases/       application logic; depends only on ports + domain
  infrastructure/   adapters implementing the ports + container.ts (composition root)
  presentation/     React Native UI: providers, state, features/<name>, theme, lib
  app/              Expo Router routes (thin; render a presentation screen)
docs/               architecture.md, roadmap.md, adr/ (decision records)
```

## Build, run & test

```bash
npm install            # restore dependencies
npm run typecheck      # tsc --noEmit  (run before every commit)
npm test               # jest          (run before every commit)
npx expo start         # run the app (press a = Android, i = iOS, w = web)
npm run android | ios | web
```

Tests use `@jest/globals` imports and run the domain/use-cases against in-memory adapters with a
`FixedClock` and `SeqIdGenerator` (see `src/test/fakes.ts`). New behaviour ⇒ a test first.

## Session conventions

- A `SessionStart` hook prints the current git branch/status and the next roadmap step — **read it
  before acting**. If it reports uncommitted changes, ask before starting new work.
- Work **plan-first** for non-trivial changes; skip planning only for one-line fixes.
- Write tests before implementing new domain/use-case logic.
- Conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`). Ask before pushing.

## How to extend without lock-in (common tasks)

- **Make sharing real:** implement `SyncService` (and a durable `CalendarRepository`/`EventRepository`)
  in `infrastructure/`, then switch the wiring in `container.ts`. Nothing else changes. See
  [docs/adr/0003-local-first-sync-abstraction.md](docs/adr/0003-local-first-sync-abstraction.md).
- **Persist data:** add e.g. `AsyncStorageCalendarRepository` implementing `CalendarRepository`; swap it
  in the container.
- **Add a feature (e.g. tracking):** new `domain/<feature>` + `application/usecases` + a
  `presentation/features/<feature>` screen + an `app/<feature>.tsx` route. Don't touch calendar code.

## What's enforced elsewhere (so this file isn't load-bearing for these)

- Permissions in `.claude/settings.json` **deny** reads of `.env`/`secrets/**` and block `curl`/`wget`
  and direct `git push`.
- The `SessionStart` hook (`.claude/hooks/`) surfaces repo state at every session start.

## Expo

@AGENTS.md
