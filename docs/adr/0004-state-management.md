# ADR 0004 — UI state management

**Status:** Accepted (revisit if UI state grows complex)

## Context
The UI needs to hold and refresh application data (calendars, upcoming events) and trigger use-cases.
Options range from React context to libraries like Zustand, Redux Toolkit, or TanStack Query.

## Decision
Start with **React context + hooks** (`ServicesProvider` for dependency injection, `AppDataProvider` for
reactive data + actions). No external state library yet.
- Keeps the dependency surface small and avoids betting on a library prematurely.
- All data access still flows through use-cases, so the state mechanism is an implementation detail of
  the presentation layer and can change without touching the domain.

## Consequences
- Zero extra dependencies; easy to understand.
- Manual `refresh()` after mutations is fine at this scale; if it becomes a bottleneck or the state grows
  (caching, optimistic updates, server state with M3 sync), adopt TanStack Query and/or Zustand — a
  presentation-layer change only, behind the same use-cases.
