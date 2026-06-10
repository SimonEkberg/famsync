import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { Calendar } from "react-native-calendars";
import { CalendarEvent, occursWithin } from "@/domain/calendar/CalendarEvent";
import { CalendarId } from "@/domain/calendar/ids";
import { useAppData } from "@/presentation/state/AppDataProvider";
import {
  addDays,
  daysOfWeek,
  endOfDay,
  formatDay,
  formatMonthYear,
  formatTime,
  fromDateKey,
  isSameDay,
  startOfDay,
  startOfWeek,
  toDateKey,
} from "@/presentation/lib/datetime";
import { colors, radius, spacing } from "@/presentation/theme";

type ViewMode = "day" | "week" | "month";

const calendarTheme = {
  backgroundColor: colors.background,
  calendarBackground: colors.background,
  textSectionTitleColor: colors.textMuted,
  dayTextColor: colors.text,
  monthTextColor: colors.text,
  todayTextColor: colors.primary,
  selectedDayBackgroundColor: colors.primary,
  selectedDayTextColor: colors.onPrimary,
  arrowColor: colors.primary,
  textDisabledColor: colors.border,
};

export function CalendarScreen() {
  const { events, calendars, colorForCalendar } = useAppData();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [excluded, setExcluded] = useState<Set<string>>(() => new Set());

  const filtered = useMemo(
    () => events.filter((e) => !excluded.has(e.calendarId)),
    [events, excluded],
  );

  const calendarName = useCallback(
    (id: CalendarId) => calendars.find((c) => c.id === id)?.name ?? "",
    [calendars],
  );

  const eventsForDay = useCallback(
    (date: Date): CalendarEvent[] =>
      filtered.filter((e) => occursWithin(e, startOfDay(date), endOfDay(date))),
    [filtered],
  );

  const markedDates = useMemo(() => {
    const map: Record<string, { dots: { key: string; color: string }[]; selected?: boolean; selectedColor?: string }> = {};
    for (const e of filtered) {
      const key = toDateKey(e.startsAt);
      if (!map[key]) {
        map[key] = { dots: [] };
      }
      if (!map[key].dots.some((d) => d.key === e.calendarId)) {
        map[key].dots.push({ key: e.calendarId, color: colorForCalendar(e.calendarId) });
      }
    }
    const selectedKey = toDateKey(selectedDate);
    map[selectedKey] = {
      ...(map[selectedKey] ?? { dots: [] }),
      selected: true,
      selectedColor: colors.primary,
    };
    return map;
  }, [filtered, selectedDate, colorForCalendar]);

  function toggleCalendar(id: string) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function renderEvents(list: CalendarEvent[]) {
    if (list.length === 0) {
      return <Text style={styles.muted}>No events.</Text>;
    }
    return list.map((e) => (
      <View key={e.id} style={styles.eventRow}>
        <View style={[styles.eventDot, { backgroundColor: colorForCalendar(e.calendarId) }]} />
        <View style={styles.eventBody}>
          <Text style={styles.eventTitle}>{e.title}</Text>
          <Text style={styles.eventMeta}>
            {e.allDay ? "All day" : `${formatTime(e.startsAt)}–${formatTime(e.endsAt)}`} · {calendarName(e.calendarId)}
          </Text>
        </View>
      </View>
    ));
  }

  return (
    <View style={styles.container}>
      {/* View mode */}
      <View style={styles.segment}>
        {(["day", "week", "month"] as ViewMode[]).map((mode) => (
          <Pressable
            key={mode}
            onPress={() => setViewMode(mode)}
            style={[styles.segBtn, viewMode === mode && styles.segBtnActive]}
          >
            <Text style={[styles.segText, viewMode === mode && styles.segTextActive]}>
              {mode[0].toUpperCase() + mode.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Calendar filter (merged vs single) */}
      {calendars.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {calendars.map((c) => {
            const on = !excluded.has(c.id);
            return (
              <Pressable key={c.id} onPress={() => toggleCalendar(c.id)} style={[styles.filterChip, !on && styles.filterChipOff]}>
                <View style={[styles.filterDot, { backgroundColor: c.color, opacity: on ? 1 : 0.3 }]} />
                <Text style={[styles.filterText, !on && styles.filterTextOff]}>{c.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      <ScrollView contentContainerStyle={styles.content}>
        {viewMode === "month" ? (
          <>
            <Calendar
              current={toDateKey(selectedDate)}
              markingType="multi-dot"
              markedDates={markedDates}
              onDayPress={(day: { dateString: string }) => setSelectedDate(fromDateKey(day.dateString))}
              theme={calendarTheme}
              style={styles.calendar}
            />
            <Text style={styles.sectionTitle}>{formatDay(selectedDate)}</Text>
            {renderEvents(eventsForDay(selectedDate))}
          </>
        ) : null}

        {viewMode === "week" ? (
          <>
            <View style={styles.navRow}>
              <NavButton label="‹" onPress={() => setSelectedDate((d) => addDays(d, -7))} />
              <Text style={styles.navTitle}>Week of {formatDay(startOfWeek(selectedDate))}</Text>
              <NavButton label="›" onPress={() => setSelectedDate((d) => addDays(d, 7))} />
            </View>
            {daysOfWeek(selectedDate).map((day) => (
              <View key={toDateKey(day)} style={styles.daySection}>
                <Text style={[styles.sectionTitle, isSameDay(day, new Date()) && styles.todayTitle]}>
                  {formatDay(day)}
                  {isSameDay(day, new Date()) ? " · Today" : ""}
                </Text>
                {renderEvents(eventsForDay(day))}
              </View>
            ))}
          </>
        ) : null}

        {viewMode === "day" ? (
          <>
            <View style={styles.navRow}>
              <NavButton label="‹" onPress={() => setSelectedDate((d) => addDays(d, -1))} />
              <Text style={styles.navTitle}>{formatDay(selectedDate)}</Text>
              <NavButton label="›" onPress={() => setSelectedDate((d) => addDays(d, 1))} />
            </View>
            {renderEvents(eventsForDay(selectedDate))}
          </>
        ) : null}

        <Text style={styles.footerNote}>
          {excluded.size === 0
            ? `Merged view · ${calendars.length} ${calendars.length === 1 ? "calendar" : "calendars"}`
            : `Showing ${calendars.length - excluded.size} of ${calendars.length} calendars · ${formatMonthYear(selectedDate)}`}
        </Text>
      </ScrollView>

      <View style={styles.actions}>
        <Link href="/calendars" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Calendars</Text>
          </Pressable>
        </Link>
        <Link href="/event/new" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryText}>+ New event</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

function NavButton(props: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={styles.navButton}>
      <Text style={styles.navButtonText}>{props.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  segment: { flexDirection: "row", gap: spacing.xs, padding: spacing.md },
  segBtn: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  segBtnActive: { backgroundColor: colors.primary },
  segText: { color: colors.text, fontWeight: "600" },
  segTextActive: { color: colors.onPrimary },
  filterRow: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  filterChipOff: { opacity: 0.6 },
  filterDot: { width: 10, height: 10, borderRadius: radius.pill },
  filterText: { color: colors.text, fontSize: 13 },
  filterTextOff: { color: colors.textMuted, textDecorationLine: "line-through" },
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  calendar: { borderRadius: radius.md, overflow: "hidden" },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "700", marginTop: spacing.md },
  todayTitle: { color: colors.primary },
  daySection: { gap: spacing.xs },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm },
  navTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  navButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  navButtonText: { color: colors.text, fontSize: 18, fontWeight: "700" },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  eventDot: { width: 12, height: 12, borderRadius: radius.pill },
  eventBody: { flex: 1 },
  eventTitle: { color: colors.text, fontSize: 15, fontWeight: "600" },
  eventMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  muted: { color: colors.textMuted, fontSize: 13, paddingVertical: spacing.xs },
  footerNote: { color: colors.textMuted, fontSize: 12, textAlign: "center", marginTop: spacing.md },
  actions: { flexDirection: "row", gap: spacing.sm, padding: spacing.md },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  secondaryText: { color: colors.text, fontWeight: "600" },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  primaryText: { color: colors.onPrimary, fontWeight: "600" },
});
