import { api } from '@/trpc/server'

import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'

import ProfilePage from './profile-form'

export const metadata = {
  title: 'Profile Settings',
  description: 'Manage your profile settings and preferences.'
}

export default async function ProfileRoute() {
  const supabase = useSupabaseServer()
  await checkAuth(supabase)

  // Fetch initial profile data on the server
  const initialProfile = await api.user.getOwnProfile()

  return <ProfilePage initialProfile={initialProfile} />
}
