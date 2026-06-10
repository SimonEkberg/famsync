import { DomainError } from "@/domain/shared/DomainError";
import { CalendarVisibility } from "@/domain/calendar/CalendarVisibility";
import { CalendarId, MemberId } from "@/domain/calendar/ids";

/** A shareable calendar owned by one member and visible to its members. */
export interface Calendar {
  readonly id: CalendarId;
  readonly name: string;
  readonly color: string;
  readonly ownerId: MemberId;
  readonly memberIds: readonly MemberId[];
  readonly visibility: CalendarVisibility;
}

export interface NewCalendar {
  id: CalendarId;
  name: string;
  color: string;
  ownerId: MemberId;
  memberIds?: readonly MemberId[];
  visibility?: CalendarVisibility;
}

/** Factory enforcing invariants. Construct calendars only through this. */
export function createCalendar(input: NewCalendar): Calendar {
  const name = input.name.trim();
  if (name.length === 0) {
    throw new DomainError("Calendar name must not be empty.");
  }
  const members = new Set<MemberId>([input.ownerId, ...(input.memberIds ?? [])]);
  return {
    id: input.id,
    name,
    color: input.color,
    ownerId: input.ownerId,
    memberIds: [...members],
    visibility: input.visibility ?? "private",
  };
}

/** Returns a new Calendar with the member added (immutably). */
export function withMember(calendar: Calendar, memberId: MemberId): Calendar {
  if (calendar.memberIds.includes(memberId)) {
    return calendar;
  }
  return { ...calendar, memberIds: [...calendar.memberIds, memberId] };
}

/** Returns a new Calendar with the given visibility (immutably). */
export function withVisibility(calendar: Calendar, visibility: CalendarVisibility): Calendar {
  if (calendar.visibility === visibility) {
    return calendar;
  }
  return { ...calendar, visibility };
}
