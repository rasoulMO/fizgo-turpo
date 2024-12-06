import Link from 'next/link'
import { api } from '@/trpc/server'
import { products } from '@prisma/client'
import { Plus } from 'lucide-react'

import { ROUTES } from '@/utils/paths'
import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'

import {
  productColumns,
  productFilterableColumns,
  productSearchableColumns
} from './components/columns'

export default async function ProductsPage() {
  const supabase = useSupabaseServer()
  await checkAuth(supabase, ROUTES.SHOP_PRODUCTS)

  const { items: products } = await api.product.getAll({
    limit: 100
  })

  // Type assertion to handle the shop inclusion
  const productsWithoutShop: products[] = products.map(
    ({ shop, ...product }) => product
  )

  return (
    <div className="container py-8">
      <div className="grid gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Link href="/dashboard/shop/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Product
            </Button>
          </Link>
        </div>

        <DataTable
          key={products.length}
          columns={productColumns}
          data={productsWithoutShop ?? []}
          filterableColumns={productFilterableColumns}
          searchableColumns={productSearchableColumns}
        />
      </div>
    </div>
  )
}
