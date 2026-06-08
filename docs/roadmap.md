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

## M2 — Real date/time UX
- [ ] Replace the stepper controls with a native picker (`@react-native-community/datetimepicker`).
- [ ] Recurring events (an `RecurrenceRule` value object in the domain + expansion in a use-case).
- [ ] Day / week / month views.

## M3 — Family sync (make sharing real)
- [ ] Choose a backend (decision in a new ADR): Supabase, Firebase, or a CRDT/local-first engine.
- [ ] Implement `SyncService` + remote repositories behind the existing ports.
- [ ] Real member identity (replace the single `local-owner` member), invites, and conflict handling.
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
