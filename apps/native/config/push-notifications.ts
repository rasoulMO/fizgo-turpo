import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "./supabase";

export async function checkNotificationPermission() {
  if (!Device.isDevice) return false;
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  return existingStatus === "granted";
}

export async function registerForPushNotificationsAsync(userId: string) {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice) {
    throw new Error("Must use physical device for push notifications");
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    finalStatus = status;
  }

  // Update user preferences in database based on permission status
  const pushNotificationsEnabled = finalStatus === "granted";
  let expoPushToken = null;

  if (pushNotificationsEnabled) {
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? 
                     Constants?.easConfig?.projectId;
    
    if (!projectId) throw new Error("Project ID not found");

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({ 
        projectId,
        applicationId: projectId // Add this for development builds
      });
      expoPushToken = tokenData.data;
    } catch (e: unknown) {
      console.error("Failed to get push token:", e);
      throw new Error(`${e}`);
    }
  }

  // Update user preferences in Supabase
  const { error } = await supabase
    .from('users')
    .update({
      expo_push_token: expoPushToken,
      is_push_notification: pushNotificationsEnabled,
    })
    .eq('id', userId);

  if (error) throw error;

  return {
    pushNotificationsEnabled,
    expoPushToken
  };
}