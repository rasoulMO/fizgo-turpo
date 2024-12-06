import React from 'react'
import { router } from 'expo-router'
import { View } from 'react-native'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { H1, Muted } from '@/components/ui/typography'
import { useNotification } from '@/context/notification-provider'

export default function Home() {
  const { expoPushToken, notification, error } = useNotification()

  if (error) {
    return <Text>Error: {error.message}</Text>
  }
  console.log(JSON.stringify(notification, null, 2))


  return (
    <View className="flex-1 items-center justify-center gap-y-4 bg-background p-4">
      <H1 className="text-center">Home</H1>
      <Muted className="text-center">
        You are now authenticated and this session will persist even after
        closing the app.
      </Muted>
	  <Text>{expoPushToken}</Text>
	  <Text>
		{notification?.request.content.data.title}
	  </Text>
      <Button
        className="w-full"
        variant="default"
        size="default"
        onPress={() => router.push('/(app)/modal')}
      >
        <Text>Open Modal</Text>
      </Button>
    </View>
  )
}
