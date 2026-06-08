import { CalendarEvent } from "@/domain/calendar/CalendarEvent";
import { CalendarId, EventId } from "@/domain/calendar/ids";

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Port: persistence for events. Default adapter is in-memory; swap for a durable
 * or remote store later without changing use-cases or UI.
 */
export interface EventRepository {
  save(event: CalendarEvent): Promise<void>;
  findById(id: EventId): Promise<CalendarEvent | null>;
  listByCalendar(calendarId: CalendarId): Promise<CalendarEvent[]>;
  listBetween(range: DateRange): Promise<CalendarEvent[]>;
}
