import { Calendar } from "@/domain/calendar/Calendar";
import { CalendarId } from "@/domain/calendar/ids";

/**
 * Port: persistence for calendars. The default adapter is in-memory; it can be
 * replaced by AsyncStorage, SQLite, or a remote store without touching callers.
 */
export interface CalendarRepository {
  save(calendar: Calendar): Promise<void>;
  findById(id: CalendarId): Promise<Calendar | null>;
  listAll(): Promise<Calendar[]>;
}
