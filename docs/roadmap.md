# Roadmap

Milestones are ordered but loosely coupled — the architecture lets later ones land without rewriting
earlier work. The `SessionStart` hook surfaces the first unchecked item below as the "next step."

## M0 — Foundation ✅ (done)
- [x] Expo + React Native + TypeScript + Expo Router scaffold (iOS/Android/web).
- [x] Ports-&-adapters architecture (domain / application / infrastructure / presentation).
- [x] Local-first calendar: create calendars, add events, upcoming agenda.
- [x] `SyncService` seam with a local-only stub (share link, no cross-device sync yet).
- [x] Domain + use-case test suite; typecheck + tests green.

## M1 — Durable local persistence
- [ ] Add a durable `CalendarRepository` / `EventRepository` adapter (AsyncStorage to start, or SQLite
      via `expo-sqlite` for querying) and wire it in `container.ts`.
- [ ] Data survives app restarts. No domain/UI changes — adapter swap only.

## M2 — Calendar views & date/time UX
- [x] **Day / Week / Month views** with a visual month grid (react-native-calendars), merged across
      calendars and color-coded, with an include/exclude filter (2026-06-10).
- [x] **Calendar visibility** model (private / shared) + Shared toggle on the Calendars screen (2026-06-10).
- [ ] Replace the event stepper controls with a native picker (`@react-native-community/datetimepicker`).
- [ ] Recurring events (an `RecurrenceRule` value object in the domain + expansion in a use-case).

## M3 — Family sync (make sharing real)
- [x] Backend direction chosen: a **local-first sync engine** (ADR-0005); specific product (e.g.
      PowerSync / Legend-State / Instant) selected when M3 starts.
- [ ] Implement `SyncService` + remote repositories behind the existing ports.
- [ ] Real member identity (replace the single `local-owner` member), groups, invites, conflict handling.
- [ ] Distribute the app to family devices (EAS dev/preview builds, or Expo Go) and verify shared
      calendars from other members merge into the master view.
- [ ] Offline queue + reconcile. Core flows must still work fully offline.

## M4 — Reminders & notifications
- [ ] Local notifications for upcoming events (`expo-notifications`) behind a `Notifier` port.

## M5 — Tracking feature (the future, additive)
- [ ] Add shared tracking/lists as a **new feature module** (`domain/tracking`, use-cases,
      `presentation/features/tracking`, `app/tracking.tsx`) without modifying calendar code — proving the
      architecture scales.

## Continuous
- [ ] Keep `npm run typecheck` and `npm test` green on every change.
- [ ] Add component/integration tests (`@testing-library/react-native`) as UI grows.
- [ ] Revisit Node/Expo SDK versions on upgrade.
