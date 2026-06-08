# Architecture rules (always apply)

The dependency rule is non-negotiable. Dependencies point inward only:

- `src/domain` imports **nothing** from React, React Native, Expo, or `src/infrastructure`. Pure TS only.
- `src/application` (use-cases + ports) imports only from `src/domain` and `src/application`.
- `src/infrastructure` implements ports; it is the only layer allowed to import SDKs / native modules.
- `src/presentation` and `src/app` reach the app only through `ServicesProvider` / use-cases — never by
  importing an adapter or mutating a domain entity directly.

When adding capability that touches the outside world (storage, network, notifications, sync):
1. Define an interface in `src/application/ports`.
2. Implement it in `src/infrastructure`.
3. Wire it in `src/infrastructure/container.ts`.
Do **not** import the concrete implementation anywhere else.

Construct domain entities only through their factories so invariants always hold. Write a test before
implementing new domain or use-case logic. Run `npm run typecheck` and `npm test` before committing.
