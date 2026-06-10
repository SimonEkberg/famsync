# FamSync — Development Log (read me first)

> **At the start of every session, read this file first.** It is the living logbook of where the app is
> right now and what the last session did. Then skim [roadmap.md](roadmap.md) for the plan and
> [architecture.md](architecture.md) for how the code is organized.
>
> **At the end of every session, add a new dated entry** under *Session log* (newest first) and update
> *Current state* if anything changed. Keep it honest — this is the source of truth for "where are we?"

---

## Current state (keep this up to date)

**Status:** v0 — local-first calendar. Runs on iOS / Android / web via Expo (SDK 56, RN 0.85, React 19, TypeScript).

**What works today**
- Create calendars; a default **"Family"** calendar is seeded on first launch.
- Add events: title, calendar, start time + duration (via steppers), all-day toggle.
- **Agenda** screen lists upcoming events (next 30 days), sorted by start time.
- **Share** mints a local invite link — UI/flow only; it does **not** sync across devices yet.

**What's stubbed / not done yet**
- **Sync:** `LocalOnlySyncService` — no real cross-device sync. (ADR-0003; milestone **M1→M3**.)
- **Persistence:** in-memory only — data is lost on app restart. (Milestone **M1**.)
- **Date/time:** stepper-based entry; no native picker, no recurring events. (Milestone **M2**.)
- **Identity:** a single hard-coded member `local-owner`; real members arrive with sync. (**M3**.)

**Architecture (one line):** hexagonal ports & adapters — dependencies point inward
(`presentation → application → domain`; `infrastructure` implements the ports). Composition root is
`src/infrastructure/container.ts`. Full detail in [architecture.md](architecture.md).

**How to run:** `npm install` → `npx expo start` (needs **Node ≥ 20.19.4**). Sanity check:
`npm run typecheck && npm test`.

**Health (last verified 2026-06-09):** typecheck clean; **8 tests passing** (domain + use-cases).

---

## How to move forward (immediate next steps)

The next milestone is **M1 — durable local persistence** ([roadmap.md](roadmap.md)): add an
AsyncStorage or `expo-sqlite` adapter implementing `CalendarRepository` / `EventRepository`, and wire it
in `container.ts`. No domain or UI changes required — that's the point of the architecture. After M1:
**M2** (native date/time picker + recurrence), then **M3** (choose and wire a real sync backend so family
sharing actually works).

---

## Session log (newest first)

### 2026-06-10 — Fix: silent "can't add event" on web (Alert is a no-op)
- **Changed:** `NewEventScreen` now shows **inline** validation errors instead of `Alert.alert`
  (which doesn't render on react-native-web, so failures were silent), auto-selects the first
  calendar, disables Save while saving, and shows a "Go to Calendars" path when no calendar exists.
- **State impact:** none to features — adding events now gives visible feedback on web.
- **Next:** feature — master/merged calendar with Day/Week/Month views (M2) and group sharing
  (cross-member, needs the sync backend — M3).

### 2026-06-09 — Fix: web crash on Agenda screen (Link `asChild` array style)
- **Changed:** Flattened the array `style` on the `<Link asChild>` child `Pressable` in
  `AgendaScreen` with `StyleSheet.flatten`. expo-router's `<Slot>` rejects array `style` on cloned
  children, which crashed the web target (`npx expo start` → `w`). Set up the Windows toolchain:
  Node 24 LTS (via nvm), Android Studio, `ANDROID_HOME`, and the Expo Tools + React Native Tools VS Code extensions.
- **State impact:** none to features — app now renders on web.
- **Next:** unchanged — M1 durable persistence.

<!--
Add a new entry ABOVE this comment at the end of each session. Template:

### YYYY-MM-DD — <short title>
- **Changed:** <what you added/modified>
- **Decisions:** <any choices made and why (link an ADR if it warrants one)>
- **State impact:** <update the "Current state" section above if this changed it>
- **Next:** <the next concrete step>
-->

### 2026-06-09 — Project bootstrap
- **Changed:** Created the project from scratch.
  - Scaffolded Expo SDK 56 + React Native 0.85 + React 19 + Expo Router + TypeScript (strict).
  - Established ports-&-adapters architecture: `domain` / `application` (ports + use-cases) /
    `infrastructure` / `presentation`.
  - Domain: `Calendar`, `CalendarEvent`, `CalendarMember`, branded ids, `DomainError`.
  - Ports: `CalendarRepository`, `EventRepository`, `SyncService`, `Clock`, `IdGenerator`.
  - Use-cases: `createCalendar`, `addEvent`, `listCalendars`, `listUpcomingEvents`, `shareCalendar`.
  - Infrastructure: in-memory repositories, `LocalOnlySyncService` stub, `SystemClock`,
    `RandomIdGenerator`, `container.ts` composition root.
  - UI: `ServicesProvider` + `AppDataProvider`; Agenda / Calendars / New Event screens; Expo Router
    routes; removed the template demo UI.
  - Tests: domain + use-case suites (`jest-expo` + `@jest/globals`). Typecheck + 8 tests green.
  - Docs: README, architecture.md, roadmap.md, ADRs 0001–0004, CLAUDE.md, `.claude/` config
    (permissions, `SessionStart` hook, architecture rule), and this DEVLOG.
- **Decisions:** local-first with sync behind an interface (ADR-0003); in-memory persistence to start;
  React context instead of a state library for now (ADR-0004); repo name `famsync`.
- **State impact:** initial state established (see *Current state* above).
- **Next:** M1 — durable persistence adapter behind the repository ports.
