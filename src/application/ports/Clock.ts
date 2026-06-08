/**
 * Port: the current time. Injecting it (instead of calling `new Date()` directly)
 * keeps use-cases deterministic and unit-testable with a fake clock.
 */
export interface Clock {
  now(): Date;
}
