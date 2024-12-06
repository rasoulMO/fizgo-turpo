import { api } from '@/trpc/server'

import { DataTable } from '@/components/data-table'

import {
  partnerApplicationColumns,
  partnerApplicationFilterableColumns,
  partnerApplicationSearchableColumns
} from './components/columns'

export default async function PartnersPage() {
  const applications = await api.partnerApplications.getAll()

  return (
    <div className="container py-8">
      <div className="grid gap-8">
        <div>
          <h1 className="text-3xl font-bold">Partner Applications</h1>
          <p className="text-muted-foreground">
            Manage and review partner applications
          </p>
        </div>

        <DataTable
          columns={partnerApplicationColumns}
          data={applications}
          filterableColumns={partnerApplicationFilterableColumns}
          searchableColumns={partnerApplicationSearchableColumns}
        />
      </div>
    </div>
  )
}
