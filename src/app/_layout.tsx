import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ServicesProvider } from "@/presentation/providers/ServicesProvider";
import { AppDataProvider } from "@/presentation/state/AppDataProvider";
import { colors } from "@/presentation/theme";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ServicesProvider>
          <AppDataProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="index" options={{ title: "FamSync" }} />
              <Stack.Screen name="calendars" options={{ title: "Calendars" }} />
              <Stack.Screen
                name="event/new"
                options={{ title: "New event", presentation: "modal" }}
              />
            </Stack>
          </AppDataProvider>
        </ServicesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
