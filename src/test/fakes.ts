import { Clock } from "@/application/ports/Clock";
import { IdGenerator } from "@/application/ports/IdGenerator";

/** Deterministic clock for tests. */
export class FixedClock implements Clock {
  constructor(private readonly value: Date) {}
  now(): Date {
    return this.value;
  }
}

/** Predictable, sequential ids for tests: id-1, id-2, … */
export class SeqIdGenerator implements IdGenerator {
  private counter = 0;
  newId(): string {
    this.counter += 1;
    return `id-${this.counter}`;
  }
}
