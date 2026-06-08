import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Calendar } from "@/domain/calendar/Calendar";
import { CalendarEvent } from "@/domain/calendar/CalendarEvent";
import { CalendarId, MemberId, toMemberId } from "@/domain/calendar/ids";
import { ShareInvite } from "@/application/ports/SyncService";
import { AddEventInput, addEvent as addEventUseCase } from "@/application/usecases/addEvent";
import { createCalendar as createCalendarUseCase } from "@/application/usecases/createCalendar";
import { listCalendars } from "@/application/usecases/listCalendars";
import { listUpcomingEvents } from "@/application/usecases/listUpcomingEvents";
import { shareCalendar as shareCalendarUseCase } from "@/application/usecases/shareCalendar";
import { useServices } from "@/presentation/providers/ServicesProvider";

/** Local device owner. Real multi-member identity arrives with the sync backend. */
const CURRENT_MEMBER_ID: MemberId = toMemberId("local-owner");

export interface AppData {
  loading: boolean;
  calendars: Calendar[];
  upcomingEvents: CalendarEvent[];
  currentMemberId: MemberId;
  refresh: () => Promise<void>;
  createCalendar: (name: string, color: string) => Promise<void>;
  addEvent: (input: Omit<AddEventInput, "createdBy">) => Promise<void>;
  shareCalendar: (calendarId: CalendarId) => Promise<ShareInvite>;
}

const AppDataContext = createContext<AppData | null>(null);

/**
 * Holds the reactive view of application data and exposes actions that delegate
 * to use-cases (which depend only on ports). The UI never touches repositories
 * or the domain directly — it goes through here.
 */
export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const services = useServices();
  const [loading, setLoading] = useState(true);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);

  const refresh = useCallback(async () => {
    const [cals, events] = await Promise.all([
      listCalendars({ calendars: services.calendars }),
      listUpcomingEvents({ events: services.events, clock: services.clock }),
    ]);
    setCalendars(cals);
    setUpcomingEvents(events);
  }, [services]);

  const createCalendar = useCallback(
    async (name: string, color: string) => {
      await createCalendarUseCase(
        { calendars: services.calendars, ids: services.ids },
        { name, color, ownerId: CURRENT_MEMBER_ID },
      );
      await refresh();
    },
    [services, refresh],
  );

  const addEvent = useCallback(
    async (input: Omit<AddEventInput, "createdBy">) => {
      await addEventUseCase(
        { calendars: services.calendars, events: services.events, ids: services.ids },
        { ...input, createdBy: CURRENT_MEMBER_ID },
      );
      await refresh();
    },
    [services, refresh],
  );

  const shareCalendar = useCallback(
    (calendarId: CalendarId) =>
      shareCalendarUseCase({ calendars: services.calendars, sync: services.sync }, calendarId),
    [services],
  );

  useEffect(() => {
    let active = true;
    (async () => {
      // Seed a default calendar on first run so the app is immediately usable.
      const existing = await listCalendars({ calendars: services.calendars });
      if (existing.length === 0) {
        await createCalendarUseCase(
          { calendars: services.calendars, ids: services.ids },
          { name: "Family", color: colorForSeed(), ownerId: CURRENT_MEMBER_ID },
        );
      }
      if (active) {
        await refresh();
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [services, refresh]);

  const value: AppData = {
    loading,
    calendars,
    upcomingEvents,
    currentMemberId: CURRENT_MEMBER_ID,
    refresh,
    createCalendar,
    addEvent,
    shareCalendar,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider.");
  }
  return context;
}

function colorForSeed(): string {
  return "#208AEF";
}
