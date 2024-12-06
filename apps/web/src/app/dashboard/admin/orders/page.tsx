import { DataTable } from '@/components/data-table'

import {
  orderColumns,
  orderFilterableColumns,
  orderSearchableColumns
} from './components/orders-columns'

async function OrdersPage() {
  return (
    <DataTable
      columns={orderColumns}
      data={[]}
      filterableColumns={orderFilterableColumns}
      searchableColumns={orderSearchableColumns}
    />
  )
}

export default OrdersPage
