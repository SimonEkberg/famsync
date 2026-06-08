# Architecture

FamSync uses **hexagonal architecture (ports & adapters)** over clean, inward-pointing layers. The goal
is the project's headline requirement: the calendar is usable now, and the sharing/sync backend plus any
future features stay swappable instead of being baked into the UI or domain.

## The dependency rule

```
        ┌─────────────────────────────────────────────┐
        │                presentation                  │  React Native UI, providers, screens
        │                     │                         │
        │                     ▼                         │
        │                application                    │  use-cases + PORTS (interfaces)
        │                     │                         │
        │                     ▼                         │
        │                  domain                       │  pure entities, value objects, invariants
        └─────────────────────────────────────────────┘
                              ▲
                              │ implements the ports
                       infrastructure                     adapters: storage, sync, clock, ids
```

Source code dependencies only ever point **inward**. The domain knows nothing about React, Expo, or any
database. Infrastructure depends on the abstractions (ports) defined by the application layer — never the
other way around. This is the Dependency Inversion Principle applied at the module level.

## Layers

### `src/domain` — the model
Pure TypeScript: `Calendar`, `CalendarEvent`, `CalendarMember`, branded ids, and `DomainError`. Entities
are immutable and created only through factories (`createCalendar`, `createCalendarEvent`) that enforce
invariants (non-empty title, end ≥ start, …). No imports from React/Expo/adapters, so the whole layer is
trivially unit-testable without a device.

### `src/application` — use-cases and ports
- **Ports** (`ports/`) are interfaces the app depends on: `CalendarRepository`, `EventRepository`,
  `SyncService`, `Clock`, `IdGenerator`. These are the **seams**.
- **Use-cases** (`usecases/`) are small functions that receive their dependencies (ports) explicitly and
  orchestrate the domain: `createCalendar`, `addEvent`, `listCalendars`, `listUpcomingEvents`,
  `shareCalendar`. They contain no framework code and no `new Date()` / `Math.random()` — time and ids
  are injected, so they are deterministic and fully testable.

### `src/infrastructure` — adapters + composition root
Concrete implementations of the ports: `InMemoryCalendarRepository`, `InMemoryEventRepository`,
`LocalOnlySyncService`, `SystemClock`, `RandomIdGenerator`. `container.ts` (`createServices`) is the
**only** place that chooses which adapters are used. Swapping an implementation is a one-line change
here; tests inject fakes via `createServices(overrides)`.

### `src/presentation` — UI
React Native components organized by feature (`features/agenda`, `features/calendars`, `features/events`),
plus `theme.ts` and small `lib/` helpers. UI reaches the app exclusively through two providers:
- `ServicesProvider` — exposes the `Services` container (the ports) via React context (dependency
  injection boundary).
- `AppDataProvider` — holds the reactive view of data and exposes actions that delegate to use-cases.

Components never import an adapter or mutate a domain entity directly.

### `src/app` — routes
Expo Router file-based routes. Each route file is thin and just renders a presentation screen. The root
`_layout.tsx` wires the providers and the navigation stack.

## The sync seam (why nothing is locked in)

Family sharing is represented by a single port, `SyncService`. Today `LocalOnlySyncService` implements it
so the share flow exists end-to-end without a backend. To make sync real:

1. Implement `SyncService` (and durable `CalendarRepository`/`EventRepository`) in `infrastructure/` —
   e.g. against Supabase, Firebase, or a CRDT engine.
2. Change the wiring in `container.ts`.

The domain, every use-case, and every screen remain untouched. See
[adr/0003-local-first-sync-abstraction.md](adr/0003-local-first-sync-abstraction.md).

## Testing strategy

The domain and use-cases are the high-value, fast tests — pure logic, no device, no mocking frameworks.
They run against the in-memory adapters with a `FixedClock` and `SeqIdGenerator` (`src/test/fakes.ts`).
Component/integration tests can be added later with `@testing-library/react-native`; the architecture
keeps the surface that needs them small.

## Adding a feature without coupling

A new feature (e.g. shared tracking/lists) is **additive**:
- new `domain/<feature>` types + invariants,
- new `application/usecases` (and ports if it needs new external capability),
- a `presentation/features/<feature>` screen,
- an `app/<feature>.tsx` route.

No existing calendar code needs to change. That is the property that keeps the app scalable as scope grows.
