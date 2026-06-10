import { expect, it } from "@jest/globals";
import { addEvent } from "@/application/usecases/addEvent";
import { listEventsInRange } from "@/application/usecases/listEventsInRange";
import { createCalendar as makeCalendar } from "@/domain/calendar/Calendar";
import { toCalendarId, toMemberId } from "@/domain/calendar/ids";
import { InMemoryCalendarRepository } from "@/infrastructure/persistence/InMemoryCalendarRepository";
import { InMemoryEventRepository } from "@/infrastructure/persistence/InMemoryEventRepository";
import { SeqIdGenerator } from "@/test/fakes";

async function seed() {
  const calendars = new InMemoryCalendarRepository();
  const events = new InMemoryEventRepository();
  const ids = new SeqIdGenerator();
  const owner = toMemberId("m1");
  await calendars.save(makeCalendar({ id: toCalendarId("c1"), name: "A", color: "#111", ownerId: owner }));
  await calendars.save(makeCalendar({ id: toCalendarId("c2"), name: "B", color: "#222", ownerId: owner }));
  const add = (calendarId: string, title: string, startIso: string) =>
    addEvent(
      { calendars, events, ids },
      {
        calendarId: toCalendarId(calendarId),
        title,
        startsAt: new Date(startIso),
        endsAt: new Date(new Date(startIso).getTime() + 3600_000),
        createdBy: owner,
      },
    );
  await add("c1", "a-late", "2026-06-12T09:00:00Z");
  await add("c2", "b-early", "2026-06-11T09:00:00Z");
  await add("c1", "a-outside", "2026-07-01T09:00:00Z");
  return { calendars, events };
}

it("merges events across calendars within the window, sorted by start", async () => {
  const { events } = await seed();
  const result = await listEventsInRange(
    { events },
    { from: new Date("2026-06-10T00:00:00Z"), to: new Date("2026-06-20T00:00:00Z") },
  );
  expect(result.map((e) => e.title)).toEqual(["b-early", "a-late"]);
});

it("restricts to the given calendars when calendarIds is provided", async () => {
  const { events } = await seed();
  const result = await listEventsInRange(
    { events },
    {
      from: new Date("2026-06-10T00:00:00Z"),
      to: new Date("2026-06-20T00:00:00Z"),
      calendarIds: [toCalendarId("c1")],
    },
  );
  expect(result.map((e) => e.title)).toEqual(["a-late"]);
});
