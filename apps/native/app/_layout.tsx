import React from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { useColorScheme } from "@/lib/useColorScheme";

import { NotificationProvider } from "@/context/notification-provider";
import { SupabaseProvider } from "@/context/supabase-provider";
import { Slot } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error, executionInfo }) => {
    console.log("✅ Received a notification in the background!", {
      data,
      error,
      executionInfo,
    });
    return null;
  }
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <SupabaseProvider>
      <NotificationProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Slot />
        </ThemeProvider>
      </NotificationProvider>
    </SupabaseProvider>
  )
}
