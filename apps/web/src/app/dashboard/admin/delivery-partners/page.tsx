import { api } from '@/trpc/server'

import { DataTable } from '@/components/data-table'

import {
  deliveryPartnerColumns,
  deliveryPartnerFilterableColumns,
  deliveryPartnerSearchableColumns
} from './components/columns'

export default async function DeliveryPartnersPage() {
  const { applications } = await api.deliveryPartnerApplications.getAll({
    page: 1,
    limit: 50
  })

  return (
    <div className="container py-8">
      <div className="grid gap-8">
        <div>
          <h1 className="text-3xl font-bold">Delivery Partner Applications</h1>
          <p className="text-muted-foreground">
            Manage and review delivery partner applications
          </p>
        </div>

        <DataTable
          columns={deliveryPartnerColumns}
          data={applications}
          filterableColumns={deliveryPartnerFilterableColumns}
          searchableColumns={deliveryPartnerSearchableColumns}
        />
      </div>
    </div>
  )
}
