import { CalendarEvent, createCalendarEvent } from "@/domain/calendar/CalendarEvent";
import { CalendarId, MemberId, toEventId } from "@/domain/calendar/ids";
import { DomainError } from "@/domain/shared/DomainError";
import { CalendarRepository } from "@/application/ports/CalendarRepository";
import { EventRepository } from "@/application/ports/EventRepository";
import { IdGenerator } from "@/application/ports/IdGenerator";

export interface AddEventDeps {
  calendars: CalendarRepository;
  events: EventRepository;
  ids: IdGenerator;
}

export interface AddEventInput {
  calendarId: CalendarId;
  title: string;
  startsAt: Date;
  endsAt: Date;
  allDay?: boolean;
  location?: string | null;
  notes?: string | null;
  createdBy: MemberId;
}

export async function addEvent(deps: AddEventDeps, input: AddEventInput): Promise<CalendarEvent> {
  const calendar = await deps.calendars.findById(input.calendarId);
  if (!calendar) {
    throw new DomainError("Cannot add an event to a calendar that does not exist.");
  }
  const event = createCalendarEvent({
    id: toEventId(deps.ids.newId()),
    calendarId: input.calendarId,
    title: input.title,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    allDay: input.allDay,
    location: input.location,
    notes: input.notes,
    createdBy: input.createdBy,
  });
  await deps.events.save(event);
  return event;
}
