import { expect, it } from "@jest/globals";
import { addEvent } from "@/application/usecases/addEvent";
import { listUpcomingEvents } from "@/application/usecases/listUpcomingEvents";
import { createCalendar as makeCalendar } from "@/domain/calendar/Calendar";
import { toCalendarId, toMemberId } from "@/domain/calendar/ids";
import { InMemoryCalendarRepository } from "@/infrastructure/persistence/InMemoryCalendarRepository";
import { InMemoryEventRepository } from "@/infrastructure/persistence/InMemoryEventRepository";
import { FixedClock, SeqIdGenerator } from "@/test/fakes";

it("returns only future events within the horizon, sorted chronologically", async () => {
  const calendars = new InMemoryCalendarRepository();
  const events = new InMemoryEventRepository();
  const ids = new SeqIdGenerator();
  const clock = new FixedClock(new Date("2026-06-10T12:00:00Z"));

  await calendars.save(
    makeCalendar({ id: toCalendarId("c1"), name: "Family", color: "#208AEF", ownerId: toMemberId("m1") }),
  );

  const add = (title: string, startIso: string, endIso: string) =>
    addEvent(
      { calendars, events, ids },
      {
        calendarId: toCalendarId("c1"),
        title,
        startsAt: new Date(startIso),
        endsAt: new Date(endIso),
        createdBy: toMemberId("m1"),
      },
    );

  await add("past", "2026-06-09T09:00:00Z", "2026-06-09T10:00:00Z");
  await add("later", "2026-06-12T09:00:00Z", "2026-06-12T10:00:00Z");
  await add("soon", "2026-06-10T18:00:00Z", "2026-06-10T19:00:00Z");

  const upcoming = await listUpcomingEvents({ events, clock }, { horizonDays: 7 });

  expect(upcoming.map((event) => event.title)).toEqual(["soon", "later"]);
});
