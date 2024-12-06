import React from 'react';
import { Switch, View, ActivityIndicator, Alert, Linking, Platform, AppState } from 'react-native';
import { Text } from '@/components/ui/text';
import { useSupabase } from '@/context/supabase-provider';
import { registerForPushNotificationsAsync, checkNotificationPermission } from '@/config/push-notifications';
import { supabase } from '@/config/supabase';
import * as Notifications from 'expo-notifications';

export function NotificationSettings() {
  const { user, session } = useSupabase();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEnabled, setIsEnabled] = React.useState(false);
  const appStateRef = React.useRef(AppState.currentState);

  const loadNotificationStatus = React.useCallback(async () => {
    if (!user?.id || !session) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('is_push_notification, expo_push_token')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Failed to load notification status:', error);
        Alert.alert('Error', 'Failed to load notification settings');
        return;
      }

      // Check both database status and actual device permission
      const hasPermission = await checkNotificationPermission();
      setIsEnabled(Boolean(data?.is_push_notification && hasPermission));
    } catch (error) {
      console.error('Failed to load notification status:', error);
      Alert.alert('Error', 'Failed to load notification settings');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, session]);

  // Handle app state changes (background/foreground)
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      // App has come to the foreground
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const hasPermission = await checkNotificationPermission();
        if (hasPermission) {
          // If permissions are now granted, register the token
          try {
            const result = await registerForPushNotificationsAsync(user!.id);
            if (result.pushNotificationsEnabled) {
              await loadNotificationStatus();
            }
          } catch (error) {
            console.error('Failed to register push token:', error);
          }
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [user, loadNotificationStatus]);

  React.useEffect(() => {
    if (session) {
      loadNotificationStatus();
    }
  }, [loadNotificationStatus, session]);

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const toggleNotifications = async () => {
    if (!user || !session) {
      Alert.alert('Error', 'Please sign in to manage notifications');
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (!isEnabled) {
        // Check current permission status
        const { status } = await Notifications.getPermissionsAsync();
        
        if (status === 'denied') {
          // If denied, open settings directly
          openSettings();
          setIsLoading(false);
          return;
        }
        
        // If not denied, request permission
        const { status: newStatus } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });

        if (newStatus === 'granted') {
          const result = await registerForPushNotificationsAsync(user.id);
          if (result.pushNotificationsEnabled) {
            setIsEnabled(true);
            await loadNotificationStatus();
          }
        } else {
          // If permission not granted, open settings
          openSettings();
        }
      } else {
        // User is disabling notifications
        const { error } = await supabase
          .from('users')
          .update({
            expo_push_token: null,
            is_push_notification: false
          })
          .eq('id', user.id);
          
        if (error) {
          console.error('Failed to update notification settings:', error);
          Alert.alert('Error', 'Failed to update notification settings');
          return;
        }
        setIsEnabled(false);
        await loadNotificationStatus();
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !session) return null;

  return (
    <View className="flex-row items-center justify-between p-4">
      <View className="flex-1">
        <Text className="text-base font-medium">Push Notifications</Text>
        <Text className="text-sm text-gray-500">
          Receive notifications about important updates
        </Text>
      </View>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <Switch
          value={isEnabled}
          onValueChange={toggleNotifications}
        />
      )}
    </View>
  );
}