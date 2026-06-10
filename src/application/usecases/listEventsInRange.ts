import { CalendarEvent, compareByStart } from "@/domain/calendar/CalendarEvent";
import { CalendarId } from "@/domain/calendar/ids";
import { EventRepository } from "@/application/ports/EventRepository";

export interface ListEventsInRangeDeps {
  events: EventRepository;
}

export interface ListEventsInRangeInput {
  from: Date;
  to: Date;
  /** When given, only events from these calendars are returned. */
  calendarIds?: readonly CalendarId[];
}

/**
 * The merged/"master" query: events across all calendars within a window,
 * optionally restricted to a set of calendars, sorted chronologically.
 */
export async function listEventsInRange(
  deps: ListEventsInRangeDeps,
  input: ListEventsInRangeInput,
): Promise<CalendarEvent[]> {
  const events = await deps.events.listBetween({ from: input.from, to: input.to });
  const ids = input.calendarIds;
  const filtered = ids ? events.filter((event) => ids.includes(event.calendarId)) : events;
  return [...filtered].sort(compareByStart);
}
