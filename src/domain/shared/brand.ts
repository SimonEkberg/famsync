/**
 * Branded (nominal) types. Lets us treat plain strings as distinct ID types so a
 * CalendarId can never be passed where an EventId is expected. Pure compile-time only.
 */
declare const __brand: unique symbol;

export type Brand<T, B extends string> = T & { readonly [__brand]: B };
