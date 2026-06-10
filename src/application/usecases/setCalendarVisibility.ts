import { Calendar, withVisibility } from "@/domain/calendar/Calendar";
import { CalendarVisibility } from "@/domain/calendar/CalendarVisibility";
import { CalendarId } from "@/domain/calendar/ids";
import { DomainError } from "@/domain/shared/DomainError";
import { CalendarRepository } from "@/application/ports/CalendarRepository";

export interface SetCalendarVisibilityDeps {
  calendars: CalendarRepository;
}

export async function setCalendarVisibility(
  deps: SetCalendarVisibilityDeps,
  calendarId: CalendarId,
  visibility: CalendarVisibility,
): Promise<Calendar> {
  const calendar = await deps.calendars.findById(calendarId);
  if (!calendar) {
    throw new DomainError("Cannot change visibility of a calendar that does not exist.");
  }
  const updated = withVisibility(calendar, visibility);
  await deps.calendars.save(updated);
  return updated;
}
