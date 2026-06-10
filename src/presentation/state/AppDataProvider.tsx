import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Calendar } from "@/domain/calendar/Calendar";
import { CalendarEvent } from "@/domain/calendar/CalendarEvent";
import { CalendarVisibility } from "@/domain/calendar/CalendarVisibility";
import { CalendarId, MemberId, toMemberId } from "@/domain/calendar/ids";
import { ShareInvite } from "@/application/ports/SyncService";
import { AddEventInput, addEvent as addEventUseCase } from "@/application/usecases/addEvent";
import { createCalendar as createCalendarUseCase } from "@/application/usecases/createCalendar";
import { listCalendars } from "@/application/usecases/listCalendars";
import { listEventsInRange } from "@/application/usecases/listEventsInRange";
import { setCalendarVisibility as setCalendarVisibilityUseCase } from "@/application/usecases/setCalendarVisibility";
import { shareCalendar as shareCalendarUseCase } from "@/application/usecases/shareCalendar";
import { useServices } from "@/presentation/providers/ServicesProvider";
import { addDays, startOfDay } from "@/presentation/lib/datetime";
import { colors, paletteColor } from "@/presentation/theme";

/** Local device owner. Real multi-member identity arrives with the sync backend (M3). */
const CURRENT_MEMBER_ID: MemberId = toMemberId("local-owner");
const WINDOW_BACK_DAYS = 365;
const WINDOW_FORWARD_DAYS = 730;

export interface AppData {
  loading: boolean;
  calendars: Calendar[];
  /** All events in a broad window around today; screens filter/group client-side. */
  events: CalendarEvent[];
  currentMemberId: MemberId;
  colorForCalendar: (calendarId: CalendarId) => string;
  refresh: () => Promise<void>;
  createCalendar: (name: string) => Promise<void>;
  addEvent: (input: Omit<AddEventInput, "createdBy">) => Promise<void>;
  setCalendarVisibility: (calendarId: CalendarId, visibility: CalendarVisibility) => Promise<void>;
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
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const refresh = useCallback(async () => {
    const now = services.clock.now();
    const from = addDays(startOfDay(now), -WINDOW_BACK_DAYS);
    const to = addDays(startOfDay(now), WINDOW_FORWARD_DAYS);
    const [cals, evs] = await Promise.all([
      listCalendars({ calendars: services.calendars }),
      listEventsInRange({ events: services.events }, { from, to }),
    ]);
    setCalendars(cals);
    setEvents(evs);
  }, [services]);

  const createCalendar = useCallback(
    async (name: string) => {
      const existing = await listCalendars({ calendars: services.calendars });
      await createCalendarUseCase(
        { calendars: services.calendars, ids: services.ids },
        { name, color: paletteColor(existing.length), ownerId: CURRENT_MEMBER_ID },
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

  const setCalendarVisibility = useCallback(
    async (calendarId: CalendarId, visibility: CalendarVisibility) => {
      await setCalendarVisibilityUseCase({ calendars: services.calendars }, calendarId, visibility);
      await refresh();
    },
    [services, refresh],
  );

  const shareCalendar = useCallback(
    (calendarId: CalendarId) =>
      shareCalendarUseCase({ calendars: services.calendars, sync: services.sync }, calendarId),
    [services],
  );

  const colorForCalendar = useCallback(
    (calendarId: CalendarId): string => {
      const calendar = calendars.find((c) => c.id === calendarId);
      return calendar?.color ?? colors.primary;
    },
    [calendars],
  );

  useEffect(() => {
    let active = true;
    (async () => {
      // Seed a shared "Family" calendar on first run so the app is immediately usable.
      const existing = await listCalendars({ calendars: services.calendars });
      if (existing.length === 0) {
        await createCalendarUseCase(
          { calendars: services.calendars, ids: services.ids },
          { name: "Family", color: paletteColor(0), ownerId: CURRENT_MEMBER_ID, visibility: "shared" },
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

  const value = useMemo<AppData>(
    () => ({
      loading,
      calendars,
      events,
      currentMemberId: CURRENT_MEMBER_ID,
      colorForCalendar,
      refresh,
      createCalendar,
      addEvent,
      setCalendarVisibility,
      shareCalendar,
    }),
    [loading, calendars, events, colorForCalendar, refresh, createCalendar, addEvent, setCalendarVisibility, shareCalendar],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider.");
  }
  return context;
}
