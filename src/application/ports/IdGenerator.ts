/**
 * Port: generates unique identifiers. Injected so use-cases stay pure and tests
 * can supply predictable IDs.
 */
export interface IdGenerator {
  newId(): string;
}
