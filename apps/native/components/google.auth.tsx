import React from 'react'
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes
} from '@react-native-google-signin/google-signin'
import { useSupabase } from '@/context/supabase-provider'

export default function GoogleAuthButton() {
    const { signInWithGoogle } = useSupabase()

    React.useEffect(() => {
        GoogleSignin.configure({
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
            webClientId: '241908453752-pe7p75m132fj2dgr8psiv6l7j3a9aavv.apps.googleusercontent.com',
            iosClientId: '241908453752-n87ju25ck1kukuklnfs7bp1s107296q6.apps.googleusercontent.com'
        })
    }, [])

    const handleSignIn = async () => {
        try {
            await signInWithGoogle()
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled sign-in')
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Sign-in already in progress')
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Play services not available')
            } else {
                console.error('Sign-in error:', error)
            }
        }
    }

    return (
        <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={handleSignIn}
            style={{ width: '100%', height: 48 }}
        />
    )
}