import { Calendar, createCalendar as makeCalendar } from "@/domain/calendar/Calendar";
import { CalendarVisibility } from "@/domain/calendar/CalendarVisibility";
import { MemberId, toCalendarId } from "@/domain/calendar/ids";
import { CalendarRepository } from "@/application/ports/CalendarRepository";
import { IdGenerator } from "@/application/ports/IdGenerator";

export interface CreateCalendarDeps {
  calendars: CalendarRepository;
  ids: IdGenerator;
}

export interface CreateCalendarInput {
  name: string;
  color: string;
  ownerId: MemberId;
  visibility?: CalendarVisibility;
}

export async function createCalendar(
  deps: CreateCalendarDeps,
  input: CreateCalendarInput,
): Promise<Calendar> {
  const calendar = makeCalendar({
    id: toCalendarId(deps.ids.newId()),
    name: input.name,
    color: input.color,
    ownerId: input.ownerId,
    visibility: input.visibility,
  });
  await deps.calendars.save(calendar);
  return calendar;
}
