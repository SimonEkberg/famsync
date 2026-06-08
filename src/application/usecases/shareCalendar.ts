import { CalendarId } from "@/domain/calendar/ids";
import { DomainError } from "@/domain/shared/DomainError";
import { CalendarRepository } from "@/application/ports/CalendarRepository";
import { ShareInvite, SyncService } from "@/application/ports/SyncService";

export interface ShareCalendarDeps {
  calendars: CalendarRepository;
  sync: SyncService;
}

export async function shareCalendar(
  deps: ShareCalendarDeps,
  calendarId: CalendarId,
): Promise<ShareInvite> {
  const calendar = await deps.calendars.findById(calendarId);
  if (!calendar) {
    throw new DomainError("Cannot share a calendar that does not exist.");
  }
  return deps.sync.share(calendarId);
}
