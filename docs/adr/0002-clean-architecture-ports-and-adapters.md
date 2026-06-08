# ADR 0002 — Clean architecture with ports & adapters

**Status:** Accepted

## Context
The brief is explicit: the app must be usable now and **not lock its usability into a tight dependency**,
because the sync backend is undecided and more features (e.g. tracking) are coming. We need clear seams.

## Decision
Adopt **hexagonal architecture (ports & adapters)** over inward-pointing layers:
`presentation → application → domain`, with `infrastructure` implementing the application's **ports**.
- Domain is pure TypeScript with no framework imports.
- The application layer defines interfaces (ports) and use-cases that depend only on those interfaces.
- Concrete implementations live in infrastructure and are chosen in a single composition root
  (`container.ts`).
- The UI depends on use-cases via a `ServicesProvider`, never on concrete adapters.

## Consequences
- External choices (storage, sync, notifications) are swappable behind interfaces — the headline goal.
- Domain and use-cases are fast and trivial to unit-test (no device, no mocks beyond simple fakes).
- Slightly more upfront structure/boilerplate than a screens-call-SDKs approach; justified by the
  expected growth in scope and the undecided backend.
