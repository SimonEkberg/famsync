import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { useAppData } from "@/presentation/state/AppDataProvider";
import { formatRange } from "@/presentation/lib/datetime";
import { colors, radius, spacing } from "@/presentation/theme";

export function AgendaScreen() {
  const { upcomingEvents, calendars, loading } = useAppData();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming</Text>
        <Text style={styles.subtitle}>
          {calendars.length} {calendars.length === 1 ? "calendar" : "calendars"}
        </Text>
      </View>

      <FlatList
        data={upcomingEvents}
        keyExtractor={(event) => event.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? "Loading…" : "No upcoming events. Tap “New event” to add one."}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>
              {formatRange(item.startsAt, item.endsAt, item.allDay)}
            </Text>
            {item.location ? <Text style={styles.cardMeta}>📍 {item.location}</Text> : null}
          </View>
        )}
      />

      <View style={styles.actions}>
        <Link href="/calendars" asChild>
          <Pressable style={[styles.button, styles.secondary]}>
            <Text style={[styles.buttonText, styles.secondaryText]}>Calendars</Text>
          </Pressable>
        </Link>
        <Link href="/event/new" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>+ New event</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  title: { color: colors.text, fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: spacing.xs },
  list: { padding: spacing.lg, gap: spacing.sm },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "600" },
  cardMeta: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
  actions: { flexDirection: "row", gap: spacing.sm, padding: spacing.lg },
  button: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  secondary: { backgroundColor: colors.surfaceAlt },
  buttonText: { color: colors.onPrimary, fontWeight: "600" },
  secondaryText: { color: colors.text },
});
