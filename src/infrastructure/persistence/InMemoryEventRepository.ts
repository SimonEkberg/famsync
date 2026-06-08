import { CalendarEvent, occursWithin } from "@/domain/calendar/CalendarEvent";
import { CalendarId, EventId } from "@/domain/calendar/ids";
import { DateRange, EventRepository } from "@/application/ports/EventRepository";

/** Default adapter. Data lives in memory only — replace for durable storage. */
export class InMemoryEventRepository implements EventRepository {
  private readonly store = new Map<string, CalendarEvent>();

  async save(event: CalendarEvent): Promise<void> {
    this.store.set(event.id, event);
  }

  async findById(id: EventId): Promise<CalendarEvent | null> {
    return this.store.get(id) ?? null;
  }

  async listByCalendar(calendarId: CalendarId): Promise<CalendarEvent[]> {
    return [...this.store.values()].filter((event) => event.calendarId === calendarId);
  }

  async listBetween(range: DateRange): Promise<CalendarEvent[]> {
    return [...this.store.values()].filter((event) =>
      occursWithin(event, range.from, range.to),
    );
  }
}
