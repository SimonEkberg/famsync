import { IdGenerator } from "@/application/ports/IdGenerator";

/**
 * Dependency-free, time-ordered, unique-enough id generator for local entities.
 * If you need ids that are globally unique across devices (for real sync),
 * swap this for a UUID/ULID implementation behind the same port.
 */
export class RandomIdGenerator implements IdGenerator {
  newId(): string {
    const time = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 10);
    return `${time}-${random}`;
  }
}
