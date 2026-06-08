# ADR 0003 — Local-first, with sync behind an interface

**Status:** Accepted (backend choice deferred)

## Context
Family sharing/sync is the core long-term value, but the backend is not yet chosen (Supabase, Firebase,
a custom server, or a CRDT/local-first engine each have trade-offs). We must not block a usable app on
that decision, and we must not couple the app to whatever we pick.

## Decision
Build **local-first** and represent sync as a single port, `SyncService` (plus repository ports for
storage). Ship a `LocalOnlySyncService` stub so the app and the share flow work end-to-end on one device
today. Defer the backend decision to its own future ADR (milestone M3).

When the backend is chosen, implement `SyncService` and durable repositories in `infrastructure/` and
switch the wiring in `container.ts`. No domain, use-case, or UI code changes.

## Consequences
- The app is immediately usable and testable offline.
- The backend decision can be made later with real requirements, not guessed now.
- Cross-device sync genuinely does not work until M3 — the stub only mints a local invite link. This is
  called out in the UI and the roadmap so it isn't mistaken for working sync.
- We must keep domain entities serializable and id generation suitable for eventual multi-device use
  (revisit `IdGenerator` — likely UUID/ULID — at M3).
