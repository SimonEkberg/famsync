# ADR 0001 — Technology stack

**Status:** Accepted

## Context
We need one codebase that ships to **iOS and Android** (web is a bonus), with a large ecosystem, good
TypeScript support, and a low-friction path from zero to a running app.

## Decision
Use **Expo (managed) + React Native + TypeScript + Expo Router**.
- Expo gives a batteries-included, well-supported toolchain (build, OTA, native modules) and runs on iOS
  and Android from a single React codebase.
- Expo Router provides file-based navigation (`src/app`), matching a familiar mental model.
- TypeScript in `strict` mode for type safety.

## Consequences
- Broad ecosystem and hiring pool; fast iteration via Expo Go / dev builds.
- Tied to Expo's SDK release cadence and version matrix (managed by `expo install`).
- Some native capabilities require config plugins or a dev build rather than Expo Go.
- Node ≥ 20.19.4 is required by the current RN toolchain.
