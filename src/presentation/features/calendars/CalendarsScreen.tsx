import { useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { CalendarId } from "@/domain/calendar/ids";
import { useAppData } from "@/presentation/state/AppDataProvider";
import { colors, radius, spacing } from "@/presentation/theme";

export function CalendarsScreen() {
  const { calendars, createCalendar, shareCalendar } = useAppData();
  const [name, setName] = useState("");

  async function onCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    await createCalendar(trimmed, colors.primary);
    setName("");
  }

  async function onShare(calendarId: CalendarId) {
    const invite = await shareCalendar(calendarId);
    Alert.alert(
      "Share calendar",
      `Invite link:\n${invite.url}\n\n(Local-only for now — wiring a real sync backend is the next milestone. See docs/adr/0003.)`,
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="New calendar name"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          onSubmitEditing={onCreate}
          returnKeyType="done"
        />
        <Pressable style={styles.addButton} onPress={onCreate}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={calendars}
        keyExtractor={(calendar) => calendar.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No calendars yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.swatch, { backgroundColor: item.color }]} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>
                {item.memberIds.length} {item.memberIds.length === 1 ? "member" : "members"}
              </Text>
            </View>
            <Pressable style={styles.shareButton} onPress={() => onShare(item.id)}>
              <Text style={styles.shareText}>Share</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  form: { flexDirection: "row", gap: spacing.sm, padding: spacing.lg },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },
  addButtonText: { color: colors.onPrimary, fontWeight: "600" },
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  swatch: { width: 14, height: 14, borderRadius: radius.pill },
  cardBody: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "600" },
  cardMeta: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
  shareButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  shareText: { color: colors.text, fontWeight: "600" },
});
