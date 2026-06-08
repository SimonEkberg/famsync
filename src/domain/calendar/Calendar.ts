import { DomainError } from "@/domain/shared/DomainError";
import { CalendarId, MemberId } from "@/domain/calendar/ids";

/** A shareable calendar owned by one member and visible to its members. */
export interface Calendar {
  readonly id: CalendarId;
  readonly name: string;
  readonly color: string;
  readonly ownerId: MemberId;
  readonly memberIds: readonly MemberId[];
}

export interface NewCalendar {
  id: CalendarId;
  name: string;
  color: string;
  ownerId: MemberId;
  memberIds?: readonly MemberId[];
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
  };
}

/** Returns a new Calendar with the member added (immutably). */
export function withMember(calendar: Calendar, memberId: MemberId): Calendar {
  if (calendar.memberIds.includes(memberId)) {
    return calendar;
  }
  return { ...calendar, memberIds: [...calendar.memberIds, memberId] };
}
