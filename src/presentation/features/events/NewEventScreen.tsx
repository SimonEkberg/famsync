import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
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
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const end = useMemo(() => new Date(start.getTime() + durationMs), [start, durationMs]);
  const selected = calendarId ?? calendars[0]?.id ?? null;

  // Auto-select the first calendar once calendars load (keeps the chip highlighted).
  useEffect(() => {
    if (!calendarId && calendars.length > 0) {
      setCalendarId(calendars[0].id);
    }
  }, [calendars, calendarId]);

  function shiftStart(deltaMs: number) {
    setStart((current) => new Date(current.getTime() + deltaMs));
  }

  async function onSave() {
    if (!title.trim()) {
      setError("Please enter a title for the event.");
      return;
    }
    if (!selected) {
      setError("Create a calendar first, then add events to it.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await addEvent({ calendarId: selected, title, startsAt: start, endsAt: end, allDay });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the event.");
      setSaving(false);
    }
  }

  if (calendars.length === 0) {
    return (
      <View style={[styles.container, styles.empty]}>
        <Text style={styles.emptyTitle}>No calendar yet</Text>
        <Text style={styles.emptyBody}>You need a calendar before you can add events.</Text>
        <Link href="/calendars" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={styles.saveText}>Go to Calendars</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (error) {
            setError(null);
          }
        }}
        placeholder="e.g. Football practice"
        placeholderTextColor={colors.textMuted}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={onSave}
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

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={[styles.save, saving && styles.saveDisabled]} onPress={onSave} disabled={saving}>
        <Text style={styles.saveText}>{saving ? "Saving…" : "Save event"}</Text>
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
  empty: { alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: "700" },
  emptyBody: { color: colors.textMuted, textAlign: "center" },
  linkButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
  },
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
  error: { color: colors.danger, fontSize: 14, marginTop: spacing.sm },
  save: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  saveDisabled: { opacity: 0.6 },
  saveText: { color: colors.onPrimary, fontWeight: "700", fontSize: 16 },
  hint: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm },
});
