import { CalendarRepository } from "@/application/ports/CalendarRepository";
import { EventRepository } from "@/application/ports/EventRepository";
import { SyncService } from "@/application/ports/SyncService";
import { Clock } from "@/application/ports/Clock";
import { IdGenerator } from "@/application/ports/IdGenerator";
import { InMemoryCalendarRepository } from "@/infrastructure/persistence/InMemoryCalendarRepository";
import { InMemoryEventRepository } from "@/infrastructure/persistence/InMemoryEventRepository";
import { LocalOnlySyncService } from "@/infrastructure/sync/LocalOnlySyncService";
import { SystemClock } from "@/infrastructure/system/SystemClock";
import { RandomIdGenerator } from "@/infrastructure/system/RandomIdGenerator";

/**
 * The set of ports the application needs. The UI and use-cases depend on THIS,
 * never on a concrete adapter — so swapping an implementation (e.g. in-memory →
 * SQLite, local-only → a real sync backend) is a one-line change in createServices.
 */
export interface Services {
  calendars: CalendarRepository;
  events: EventRepository;
  sync: SyncService;
  clock: Clock;
  ids: IdGenerator;
}

/**
 * Composition root: the single place that chooses concrete adapters. Tests pass
 * `overrides` to inject fakes (e.g. a fixed Clock, a deterministic IdGenerator).
 */
export function createServices(overrides: Partial<Services> = {}): Services {
  const clock = overrides.clock ?? new SystemClock();
  const ids = overrides.ids ?? new RandomIdGenerator();
  return {
    clock,
    ids,
    calendars: overrides.calendars ?? new InMemoryCalendarRepository(),
    events: overrides.events ?? new InMemoryEventRepository(),
    sync: overrides.sync ?? new LocalOnlySyncService(ids, clock),
  };
}
