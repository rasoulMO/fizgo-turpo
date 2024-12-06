import { useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'

import { TypedSupabaseClient } from '@/types/index'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

let client: TypedSupabaseClient | undefined

function getSupabaseBrowserClient() {
  if (client) {
    return client
  }

  client = createClient()

  return client
}

function useSupabaseBrowser() {
  return useMemo(getSupabaseBrowserClient, [])
}

export default useSupabaseBrowser
