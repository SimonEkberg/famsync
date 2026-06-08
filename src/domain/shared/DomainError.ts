/**
 * Raised when a domain invariant is violated. The domain layer never throws
 * framework or infrastructure errors — only DomainError — so callers can map it
 * to UI messages without leaking implementation details.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}
