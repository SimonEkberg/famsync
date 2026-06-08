import { Calendar } from "@/domain/calendar/Calendar";
import { CalendarId } from "@/domain/calendar/ids";
import { CalendarRepository } from "@/application/ports/CalendarRepository";

/** Default adapter. Data lives in memory only — replace for durable storage. */
export class InMemoryCalendarRepository implements CalendarRepository {
  private readonly store = new Map<string, Calendar>();

  async save(calendar: Calendar): Promise<void> {
    this.store.set(calendar.id, calendar);
  }

  async findById(id: CalendarId): Promise<Calendar | null> {
    return this.store.get(id) ?? null;
  }

  async listAll(): Promise<Calendar[]> {
    return [...this.store.values()];
  }
}
