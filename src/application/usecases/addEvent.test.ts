import { expect, it } from "@jest/globals";
import { addEvent } from "@/application/usecases/addEvent";
import { createCalendar as makeCalendar } from "@/domain/calendar/Calendar";
import { DomainError } from "@/domain/shared/DomainError";
import { toCalendarId, toMemberId } from "@/domain/calendar/ids";
import { InMemoryCalendarRepository } from "@/infrastructure/persistence/InMemoryCalendarRepository";
import { InMemoryEventRepository } from "@/infrastructure/persistence/InMemoryEventRepository";
import { SeqIdGenerator } from "@/test/fakes";

function setup() {
  return {
    calendars: new InMemoryCalendarRepository(),
    events: new InMemoryEventRepository(),
    ids: new SeqIdGenerator(),
  };
}

const input = {
  calendarId: toCalendarId("c1"),
  title: "Swim practice",
  startsAt: new Date("2026-06-10T09:00:00Z"),
  endsAt: new Date("2026-06-10T10:00:00Z"),
  createdBy: toMemberId("m1"),
};

it("rejects adding an event to a calendar that does not exist", async () => {
  const deps = setup();
  await expect(addEvent(deps, input)).rejects.toBeInstanceOf(DomainError);
});

it("saves the event to an existing calendar and returns it", async () => {
  const deps = setup();
  await deps.calendars.save(
    makeCalendar({ id: toCalendarId("c1"), name: "Family", color: "#208AEF", ownerId: toMemberId("m1") }),
  );

  const event = await addEvent(deps, input);

  expect(event.id).toBe("id-1");
  const stored = await deps.events.listByCalendar(toCalendarId("c1"));
  expect(stored).toHaveLength(1);
  expect(stored[0].title).toBe("Swim practice");
});
