import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'
import { DataTable } from '@/components/data-table'

import {
  contactColumns,
  contactFilterableColumns,
  contactSearchableColumns
} from './components/contact-columns'

async function ContactsPage() {
  const supabase = useSupabaseServer()
  await checkAuth(supabase)

  return (
    <DataTable
      data={[]}
      columns={contactColumns}
      filterableColumns={contactFilterableColumns}
      searchableColumns={contactSearchableColumns}
    />
  )
}

export default ContactsPage
