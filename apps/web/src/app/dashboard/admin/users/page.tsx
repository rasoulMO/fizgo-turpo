import { api } from '@/trpc/server'

import { ROUTES } from '@/utils/paths'
import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'
import { DataTable } from '@/components/data-table'

import {
  usersColumns,
  usersFilterableColumns,
  usersSearchableColumns
} from './components/columns'
import { userSchema } from './data/schema'

async function UsersPage() {
  const supabase = useSupabaseServer()
  await checkAuth(supabase, ROUTES.ADMIN_USERS)
  const rawUsers = await api.user.getAll()

  const users = rawUsers.map((user) =>
    userSchema.parse({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role
    })
  )

  return (
    <div className="container py-8">
      <div className="grid gap-8">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage and review users</p>
        </div>

        <DataTable
          columns={usersColumns}
          data={users}
          filterableColumns={usersFilterableColumns}
          searchableColumns={usersSearchableColumns}
        />
      </div>
    </div>
  )
}

export default UsersPage
