import { DomainError } from "@/domain/shared/DomainError";
import { CalendarId, EventId, MemberId } from "@/domain/calendar/ids";

/** An event on a calendar. Immutable; mutate via the pure helpers below. */
export interface CalendarEvent {
  readonly id: EventId;
  readonly calendarId: CalendarId;
  readonly title: string;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly allDay: boolean;
  readonly location: string | null;
  readonly notes: string | null;
  readonly createdBy: MemberId;
}

export interface NewCalendarEvent {
  id: EventId;
  calendarId: CalendarId;
  title: string;
  startsAt: Date;
  endsAt: Date;
  allDay?: boolean;
  location?: string | null;
  notes?: string | null;
  createdBy: MemberId;
}

/** Factory enforcing invariants. Construct events only through this. */
export function createCalendarEvent(input: NewCalendarEvent): CalendarEvent {
  const title = input.title.trim();
  if (title.length === 0) {
    throw new DomainError("Event title must not be empty.");
  }
  if (input.endsAt.getTime() < input.startsAt.getTime()) {
    throw new DomainError("Event end must not be before its start.");
  }
  return {
    id: input.id,
    calendarId: input.calendarId,
    title,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    allDay: input.allDay ?? false,
    location: input.location ?? null,
    notes: input.notes ?? null,
    createdBy: input.createdBy,
  };
}

/** Chronological comparator for sorting events by start time. */
export function compareByStart(a: CalendarEvent, b: CalendarEvent): number {
  return a.startsAt.getTime() - b.startsAt.getTime();
}

/** True if the event overlaps the [from, to) window. */
export function occursWithin(event: CalendarEvent, from: Date, to: Date): boolean {
  return event.startsAt.getTime() < to.getTime() && event.endsAt.getTime() >= from.getTime();
}
