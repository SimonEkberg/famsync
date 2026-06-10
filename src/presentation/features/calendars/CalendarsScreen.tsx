import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useAppData } from "@/presentation/state/AppDataProvider";
import { colors, radius, spacing } from "@/presentation/theme";

export function CalendarsScreen() {
  const { calendars, createCalendar, setCalendarVisibility } = useAppData();
  const [name, setName] = useState("");

  async function onCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    await createCalendar(trimmed);
    setName("");
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
        ListFooterComponent={
          <Text style={styles.footer}>
            “Shared” marks a calendar for your family group. Cross-device sharing (other members
            actually seeing it) arrives with sync — see docs/roadmap.md.
          </Text>
        }
        renderItem={({ item }) => {
          const shared = item.visibility === "shared";
          return (
            <View style={styles.card}>
              <View style={[styles.swatch, { backgroundColor: item.color }]} />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardMeta}>
                  {item.memberIds.length} {item.memberIds.length === 1 ? "member" : "members"} ·{" "}
                  {shared ? "Shared with family" : "Private"}
                </Text>
              </View>
              <View style={styles.toggle}>
                <Text style={styles.toggleLabel}>Shared</Text>
                <Switch
                  value={shared}
                  onValueChange={(on) => setCalendarVisibility(item.id, on ? "shared" : "private")}
                />
              </View>
            </View>
          );
        }}
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
  footer: { color: colors.textMuted, fontSize: 12, marginTop: spacing.md },
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
  toggle: { alignItems: "center", gap: 2 },
  toggleLabel: { color: colors.textMuted, fontSize: 11 },
});
