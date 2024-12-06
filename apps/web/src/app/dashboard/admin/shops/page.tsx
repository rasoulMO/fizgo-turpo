import { api } from '@/trpc/server'

import { DataTable } from '@/components/data-table'

import {
  shopColumns,
  shopFilterableColumns,
  shopSearchableColumns
} from './components/shpos-columns'

async function ShopsPage() {
  const shops = await api.shop.getAll()

  return (
    <div className="container py-8">
      <div className="grid gap-8">
        <div>
          <h1 className="text-3xl font-bold">Shops</h1>
          <p className="text-muted-foreground">Manage and review shops</p>
        </div>

        <DataTable
          columns={shopColumns}
          data={shops ?? []}
          filterableColumns={shopFilterableColumns}
          searchableColumns={shopSearchableColumns}
        />
      </div>
    </div>
  )
}

export default ShopsPage
