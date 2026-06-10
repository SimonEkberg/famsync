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
- **Master calendar** (home): **Day / Week / Month** views with a visual month grid
  (react-native-calendars), color-coded per calendar, showing a **merged view** of all calendars plus a
  filter to include/exclude each one.
- Create calendars (each auto-assigned a distinct color); a shared **"Family"** calendar is seeded on first launch.
- Mark a calendar **Shared with family** vs **Private** (a model flag for future sync; no cross-device effect yet).
- Add events: title, calendar, start + duration (steppers), all-day — with visible inline validation.

**What's stubbed / not done yet**
- **Cross-device family sharing:** the "Shared" flag has no effect across devices yet — real
  distribution/sync needs the backend. (ADR-0003/0005; milestone **M3**, planned around a local-first engine.)
- **Persistence:** in-memory only — data is lost on app restart. (Milestone **M1**.)
- **Event date/time entry:** still stepper-based; no native date/time picker, no recurring events. (Milestone **M2**.)
- **Identity:** a single hard-coded member `local-owner`; real members arrive with sync. (**M3**.)

**Architecture (one line):** hexagonal ports & adapters — dependencies point inward
(`presentation → application → domain`; `infrastructure` implements the ports). Composition root is
`src/infrastructure/container.ts`. Full detail in [architecture.md](architecture.md).

**How to run:** `npm install` → `npx expo start` (needs **Node ≥ 20.19.4**). Sanity check:
`npm run typecheck && npm test`.

**Health (last verified 2026-06-10):** typecheck clean; **10 tests passing** (domain + use-cases).

---

## How to move forward (immediate next steps)

The next milestone is **M1 — durable local persistence** ([roadmap.md](roadmap.md)): add an
AsyncStorage or `expo-sqlite` adapter implementing `CalendarRepository` / `EventRepository`, and wire it
in `container.ts`. No domain or UI changes required — that's the point of the architecture. After M1:
**M2** (native date/time picker + recurrence), then **M3** (choose and wire a real sync backend so family
sharing actually works).

---

## Session log (newest first)

### 2026-06-10 — Feature: master calendar (Day/Week/Month, merged, colored) + visibility model
- **Changed:** New **CalendarScreen** is the home: Day/Week/Month views with a visual month grid
  (react-native-calendars), per-calendar colors, a **merged** view of all calendars + an include/exclude
  filter. Added `Calendar.visibility` (private/shared) + `withVisibility`; use-cases `listEventsInRange`
  and `setCalendarVisibility` (+ tests); a per-calendar color palette; a broad events window in
  `AppDataProvider`; and a Shared/Private toggle on the Calendars screen. Removed the old Agenda screen.
- **Decisions:** build the local UX first; plan real family sync (M3) around a **local-first sync engine**
  (see ADR-0005). New user calendars default to **private**; the seeded "Family" calendar is **shared**.
- **State impact:** *Current state* updated above. typecheck clean; 10 tests pass.
- **Next:** M1 (durable persistence) so data survives restarts → M2 (native date/time picker + recurrence)
  → M3 (local-first sync to make family sharing real across devices).

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
