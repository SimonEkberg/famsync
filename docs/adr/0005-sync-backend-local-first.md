# ADR 0005 — Sync backend direction: local-first engine

**Status:** Accepted (direction only; specific product chosen when M3 starts)

## Context
ADR-0003 deferred the backend choice and kept sync behind the `SyncService` port. The product goal is a
**family calendar shared across members' phones**, where each member owns calendars and marks some
**shared** with the family group, and everyone sees a **merged** view. This needs cross-device sync that
also works offline (phones are frequently offline) and merges concurrent edits sanely.

## Decision
Plan M3 around a **local-first sync engine** rather than a traditional request/response backend.
- Local-first engines keep a full local copy (so the app stays fast and fully usable offline) and sync +
  merge changes in the background — a natural fit for a phone calendar and for our existing local-first,
  ports-&-adapters design.
- Candidate products to evaluate at M3 start: **PowerSync**, **Legend-State (sync)**, **Instant (InstantDB)**,
  and CRDT libraries (Yjs/Automerge) over a small relay. Decision criteria: offline/merge behavior, auth +
  per-group sharing/row-level security, Expo/React Native support, cost for a small family, and effort.
- It plugs in behind the existing `SyncService` + `CalendarRepository` / `EventRepository` ports and the
  `container.ts` composition root — no domain or UI changes.

## Consequences
- The local-first UX we built (offline-usable, merged view) carries straight through; the engine just makes
  the merge cross-device and real.
- We must add real member identity and groups (replacing the single `local-owner`) and decide the sharing
  unit (per-calendar `visibility` already models this).
- App distribution to family devices (EAS builds / Expo Go) becomes part of M3, since "shared across
  phones" requires the app actually running on those phones.
- A specific engine is **not** chosen yet — this ADR fixes the direction; a follow-up ADR will record the
  concrete product and schema once M3 begins.
