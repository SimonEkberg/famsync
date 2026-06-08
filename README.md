# FamSync

A **local-first family calendar** for **iOS and Android** (and web for free), built with Expo +
React Native + TypeScript. Create calendars, add events, and share them with family members.

It is deliberately architected with **ports & adapters** so the app is fully usable today on one device,
while the family-sharing/sync backend — and future features like shared tracking/lists — stay
**swappable** and don't lock the core experience to any one dependency.

## Status

**v0 — local-first calendar.** You can create calendars, add events, and see an upcoming agenda.
Sharing/sync is defined behind a `SyncService` interface with a **local-only stub** (it mints an invite
link but does not yet sync across devices). Wiring a real backend is the next milestone — see
[docs/roadmap.md](docs/roadmap.md).

## Prerequisites

- **Node.js ≥ 20.19.4** (or 22.x) — required by the React Native 0.85 toolchain. (Older versions may
  install but Metro can misbehave.)
- **iOS:** macOS + Xcode, or the Expo Go app on a device. **Android:** Android Studio emulator, or Expo
  Go on a device.

## Quickstart

```bash
npm install                      # restore dependencies
npm run typecheck && npm test    # optional: confirm everything is green
npx expo start                   # then press: i (iOS) · a (Android) · w (web)
```

## Scripts

| Script | What it does |
|---|---|
| `npm run typecheck` | `tsc --noEmit` — full type check |
| `npm test` | Jest — domain + use-case tests |
| `npx expo start` | Start the dev server (iOS / Android / web) |
| `npm run android` / `ios` / `web` | Start targeting a platform |
| `npm run lint` | ESLint via `expo lint` |

## Architecture in one diagram

```
presentation ──▶ application ──▶ domain        (dependencies point inward only)
infrastructure ──▶ (implements the ports)
```

- `src/domain` — pure model (entities, invariants), no framework imports.
- `src/application` — use-cases + **ports** (`CalendarRepository`, `EventRepository`, `SyncService`, …).
- `src/infrastructure` — adapters implementing the ports + `container.ts` (composition root).
- `src/presentation` — React Native UI, reaching the app only through use-cases.
- `src/app` — Expo Router routes (thin).

The full explanation, including how to swap the sync backend without touching the UI, is in
[docs/architecture.md](docs/architecture.md). Conventions for contributors (and AI agents) are in
[CLAUDE.md](CLAUDE.md).

## Project layout

```
src/
  domain/          entities, value objects, invariants (pure TypeScript)
  application/
    ports/         interfaces the app depends on (swappable seams)
    usecases/      application logic (depends only on ports + domain)
  infrastructure/  adapters + container.ts
  presentation/    providers, state, features/<name>, theme, lib
  app/             Expo Router routes
docs/              architecture.md, roadmap.md, adr/
```

## Testing

Jest (via `jest-expo`) runs the domain and use-cases against in-memory adapters with a deterministic
clock and id generator (`src/test/fakes.ts`). New behaviour gets a test first. Run `npm test`.

## License

[MIT](LICENSE) © Simon Ekberg.
