import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import * as AppleAuthentication from 'expo-apple-authentication'
import { SplashScreen, useRouter, useSegments } from 'expo-router'
import { AppState } from 'react-native';

import { supabase } from '@/config/supabase'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { checkNotificationPermission, registerForPushNotificationsAsync } from '@/config/push-notifications';

SplashScreen.preventAutoHideAsync()

type SupabaseContextProps = {
  user: User | null
  session: Session | null
  initialized?: boolean
  signUp: (email: string, password: string) => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signInWithApple: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

type SupabaseProviderProps = {
  children: React.ReactNode
}

export const SupabaseContext = createContext<SupabaseContextProps>({
  user: null,
  session: null,
  initialized: false,
  signUp: async () => {},
  signInWithPassword: async () => {},
  signInWithApple: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {}
})

export const useSupabase = () => useContext(SupabaseContext)

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  const router = useRouter()
  const segments = useSegments() as string[]
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [initialized, setInitialized] = useState<boolean>(false)

  const signUp = async (email: string, password: string) => {
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (signUpError) throw signUpError

      // If sign up successful, request notification permissions
      if (data.user) {
        try {
          await registerForPushNotificationsAsync(data.user.id)
        } catch (error) {
          console.log('Notification permission not granted:', error)
          // Continue even if notification permission fails
        }
      }
    } catch (error) {
      throw error
    }
  }

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      throw error
    }
  }

  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ]
      })

      if (credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken
        })

        if (error) throw error
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        console.log('User cancelled Apple sign in')
      } else {
        console.error('Apple sign in error:', error)
        throw error
      }
    }
  }

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices()
      const userInfo = await GoogleSignin.signIn()
      if (userInfo.data?.idToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken
        })
        if (error) {
          console.error('Supabase Google sign in error:', error)
          throw error
        }
      } else {
        throw new Error('no ID token present!')
      }
    } catch (error: any) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session ? session.user : null)
      setInitialized(true)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session ? session.user : null)
    })
  }, [])

  useEffect(() => {
    if (!initialized) return

    const inProtectedGroup = segments[0] === '(protected)'
    if (session && !inProtectedGroup) {
      router.replace('/(app)/settings' as any)
    } else if (!session) {
      router.replace('/(app)/welcome' as any)
    }

    /* HACK: Something must be rendered when determining the initial auth state... 
		instead of creating a loading screen, we use the SplashScreen and hide it after
		a small delay (500 ms)
		*/

    setTimeout(() => {
      SplashScreen.hideAsync()
    }, 500)
  }, [initialized, session])

  // Handle notification permission changes
  useEffect(() => {
    if (!user) return;

    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        const hasPermission = await checkNotificationPermission();
        const currentPreferences = user.user_metadata?.preferences;
        
        // Update if permission status changed
        if (hasPermission !== currentPreferences?.pushNotifications) {
          try {
            await registerForPushNotificationsAsync(user.id);
          } catch (error) {
            console.error('Failed to update push notification settings:', error);
          }
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [user]);

  return (
    <SupabaseContext.Provider
      value={{
        user,
        session,
        initialized,
        signUp,
        signInWithPassword,
        signInWithApple,
		signInWithGoogle,
        signOut
      }}
    >
      {children}
    </SupabaseContext.Provider>
  )
}
