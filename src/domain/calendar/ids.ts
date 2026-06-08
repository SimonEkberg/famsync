import { Brand } from "@/domain/shared/brand";

export type CalendarId = Brand<string, "CalendarId">;
export type EventId = Brand<string, "EventId">;
export type MemberId = Brand<string, "MemberId">;

export const toCalendarId = (value: string): CalendarId => value as CalendarId;
export const toEventId = (value: string): EventId => value as EventId;
export const toMemberId = (value: string): MemberId => value as MemberId;
