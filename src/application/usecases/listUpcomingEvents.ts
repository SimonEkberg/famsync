import { CalendarEvent, compareByStart } from "@/domain/calendar/CalendarEvent";
import { Clock } from "@/application/ports/Clock";
import { EventRepository } from "@/application/ports/EventRepository";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_HORIZON_DAYS = 30;

export interface ListUpcomingEventsDeps {
  events: EventRepository;
  clock: Clock;
}

export interface ListUpcomingEventsInput {
  /** How many days ahead to include. Defaults to 30. */
  horizonDays?: number;
}

export async function listUpcomingEvents(
  deps: ListUpcomingEventsDeps,
  input: ListUpcomingEventsInput = {},
): Promise<CalendarEvent[]> {
  const from = deps.clock.now();
  const horizon = input.horizonDays ?? DEFAULT_HORIZON_DAYS;
  const to = new Date(from.getTime() + horizon * DAY_MS);
  const events = await deps.events.listBetween({ from, to });
  return [...events].sort(compareByStart);
}
