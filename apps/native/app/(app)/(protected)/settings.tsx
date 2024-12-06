import React from 'react'
import { View } from 'react-native'

import { useSupabase } from '@/context/supabase-provider'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { H1, Muted } from '@/components/ui/typography'
import { NotificationSettings } from '@/components/notification-settings'

export default function Settings() {
  const { signOut, user } = useSupabase()

  return (
    <View className="flex-1 items-center justify-center gap-y-4 bg-background p-4">
      <H1 className="text-center">Settings</H1>
      <Muted className="text-center">Signed in as: {user?.email}</Muted>
      <NotificationSettings />
      <Button
        className="w-full"
        size="default"
        variant="default"
        onPress={signOut}
      >
        <Text>Sign Out</Text>
      </Button>
    </View>
  )
}
