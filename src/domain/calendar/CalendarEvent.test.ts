import { describe, expect, it } from "@jest/globals";
import {
  compareByStart,
  createCalendarEvent,
  occursWithin,
} from "@/domain/calendar/CalendarEvent";
import { DomainError } from "@/domain/shared/DomainError";
import { toCalendarId, toEventId, toMemberId } from "@/domain/calendar/ids";

const base = {
  id: toEventId("e1"),
  calendarId: toCalendarId("c1"),
  title: "  Dentist  ",
  startsAt: new Date("2026-06-10T09:00:00Z"),
  endsAt: new Date("2026-06-10T10:00:00Z"),
  createdBy: toMemberId("m1"),
};

describe("createCalendarEvent", () => {
  it("trims the title and applies defaults", () => {
    const event = createCalendarEvent(base);
    expect(event.title).toBe("Dentist");
    expect(event.allDay).toBe(false);
    expect(event.location).toBeNull();
    expect(event.notes).toBeNull();
  });

  it("rejects an empty title", () => {
    expect(() => createCalendarEvent({ ...base, title: "   " })).toThrow(DomainError);
  });

  it("rejects an end before the start", () => {
    expect(() =>
      createCalendarEvent({ ...base, endsAt: new Date("2026-06-10T08:00:00Z") }),
    ).toThrow(DomainError);
  });
});

describe("event helpers", () => {
  it("compareByStart orders chronologically", () => {
    const early = createCalendarEvent({
      ...base,
      id: toEventId("a"),
      startsAt: new Date("2026-06-10T08:00:00Z"),
      endsAt: new Date("2026-06-10T09:00:00Z"),
    });
    const late = createCalendarEvent(base);
    expect([late, early].sort(compareByStart)[0]).toBe(early);
  });

  it("occursWithin detects overlap with a window", () => {
    const event = createCalendarEvent(base);
    expect(
      occursWithin(event, new Date("2026-06-10T00:00:00Z"), new Date("2026-06-11T00:00:00Z")),
    ).toBe(true);
    expect(
      occursWithin(event, new Date("2026-06-11T00:00:00Z"), new Date("2026-06-12T00:00:00Z")),
    ).toBe(false);
  });
});
