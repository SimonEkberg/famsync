import { MemberId } from "@/domain/calendar/ids";

/** A person who can view/edit a shared calendar. */
export interface CalendarMember {
  readonly id: MemberId;
  readonly displayName: string;
}
