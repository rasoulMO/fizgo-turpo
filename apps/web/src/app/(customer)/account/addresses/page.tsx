import { api } from '@/trpc/server'

import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'

import AddressesPage from './addresses-page'

export const metadata = {
  title: 'Manage Addresses',
  description: 'Manage your delivery addresses'
}

export default async function AddressesSettingsPage() {
  const supabase = useSupabaseServer()
  await checkAuth(supabase)
  const addresses = await api.address.getAll()

  return <AddressesPage initialAddresses={addresses} />
}
