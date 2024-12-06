import * as React from 'react'
import * as AppleAuthentication from 'expo-apple-authentication'
import { Platform } from 'react-native'

import { useSupabase } from '@/context/supabase-provider'

export default function AppleAuthButton() {
  const { signInWithApple } = useSupabase()

  if (Platform.OS !== 'ios') return null

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      style={{ width: 200, height: 64 }}
      onPress={async () => {
        try {
          await signInWithApple()
        } catch (error) {
          console.error('Apple sign in failed:', error)
        }
      }}
    />
  )
}
