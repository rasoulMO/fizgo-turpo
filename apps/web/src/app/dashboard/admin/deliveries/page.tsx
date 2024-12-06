import { DataTable } from '@/components/data-table'

import {
  deliveryColumns,
  filterableColumns,
  searchableColumns
} from './components/deliveries-columns'

async function DeliveriesPage() {
  return (
    <DataTable
      columns={deliveryColumns}
      data={[]}
      filterableColumns={filterableColumns}
      searchableColumns={searchableColumns}
    />
  )
}

export default DeliveriesPage
