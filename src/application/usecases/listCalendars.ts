import { Calendar } from "@/domain/calendar/Calendar";
import { CalendarRepository } from "@/application/ports/CalendarRepository";

export interface ListCalendarsDeps {
  calendars: CalendarRepository;
}

export async function listCalendars(deps: ListCalendarsDeps): Promise<Calendar[]> {
  return deps.calendars.listAll();
}
