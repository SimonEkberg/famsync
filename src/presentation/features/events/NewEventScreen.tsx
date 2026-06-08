import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { CalendarId } from "@/domain/calendar/ids";
import { useAppData } from "@/presentation/state/AppDataProvider";
import { formatRange, nextTopOfHour } from "@/presentation/lib/datetime";
import { colors, radius, spacing } from "@/presentation/theme";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const HALF_HOUR_MS = 30 * 60 * 1000;
const DURATIONS = [HALF_HOUR_MS, HOUR_MS, 2 * HOUR_MS];

export function NewEventScreen() {
  const router = useRouter();
  const { calendars, addEvent } = useAppData();

  const [title, setTitle] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [calendarId, setCalendarId] = useState<CalendarId | null>(null);
  const [start, setStart] = useState<Date>(() => nextTopOfHour(new Date()));
  const [durationMs, setDurationMs] = useState<number>(HOUR_MS);

  const end = useMemo(() => new Date(start.getTime() + durationMs), [start, durationMs]);
  const selected = calendarId ?? calendars[0]?.id ?? null;

  function shiftStart(deltaMs: number) {
    setStart((current) => new Date(current.getTime() + deltaMs));
  }

  async function onSave() {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a title for the event.");
      return;
    }
    if (!selected) {
      Alert.alert("No calendar", "Create a calendar before adding events.");
      return;
    }
    await addEvent({ calendarId: selected, title, startsAt: start, endsAt: end, allDay });
    router.back();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Football practice"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Calendar</Text>
      <View style={styles.chips}>
        {calendars.map((calendar) => {
          const active = selected === calendar.id;
          return (
            <Pressable
              key={calendar.id}
              onPress={() => setCalendarId(calendar.id)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{calendar.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>All day</Text>
        <Switch value={allDay} onValueChange={setAllDay} />
      </View>

      <Text style={styles.label}>When</Text>
      <Text style={styles.when}>{formatRange(start, end, allDay)}</Text>
      <View style={styles.stepperRow}>
        <Stepper label="−1d" onPress={() => shiftStart(-DAY_MS)} />
        <Stepper label="+1d" onPress={() => shiftStart(DAY_MS)} />
        <Stepper label="−1h" onPress={() => shiftStart(-HOUR_MS)} />
        <Stepper label="+1h" onPress={() => shiftStart(HOUR_MS)} />
      </View>
      {!allDay ? (
        <View style={styles.stepperRow}>
          {DURATIONS.map((d) => (
            <Stepper
              key={d}
              label={d === HALF_HOUR_MS ? "30m" : `${d / HOUR_MS}h`}
              active={durationMs === d}
              onPress={() => setDurationMs(d)}
            />
          ))}
        </View>
      ) : null}

      <Pressable style={styles.save} onPress={onSave}>
        <Text style={styles.saveText}>Save event</Text>
      </Pressable>
      <Text style={styles.hint}>
        A native date/time picker replaces these steppers in a later milestone — see docs/roadmap.md.
      </Text>
    </ScrollView>
  );
}

function Stepper(props: { label: string; onPress: () => void; active?: boolean }) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[styles.stepper, props.active && styles.stepperActive]}
    >
      <Text style={[styles.stepperText, props.active && styles.stepperTextActive]}>
        {props.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.sm },
  label: { color: colors.textMuted, fontSize: 13, marginTop: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text },
  chipTextActive: { color: colors.onPrimary, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  when: { color: colors.text, fontSize: 16, fontWeight: "600" },
  stepperRow: { flexDirection: "row", gap: spacing.sm },
  stepper: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  stepperActive: { backgroundColor: colors.primary },
  stepperText: { color: colors.text, fontWeight: "600" },
  stepperTextActive: { color: colors.onPrimary },
  save: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  saveText: { color: colors.onPrimary, fontWeight: "700", fontSize: 16 },
  hint: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm },
});
