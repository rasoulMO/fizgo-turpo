'use client'

import {
  MEN_CATEGORIES_LIST,
  MenCategoryKey,
  WOMEN_CATEGORIES_LIST
} from '@/options'
import { ProductCategory, ProductGender, products } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'

import { DataTableRowActions } from './data-table-row-actions'

export const productColumns: ColumnDef<products>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue('name')}</span>
          <span className="text-xs text-muted-foreground">
            SKU: {row.original.sku || 'N/A'}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'gender',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => {
      const gender = row.getValue('gender') as ProductGender
      return <span>{gender}</span>
    }
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const gender = row.original.gender
      const categoryKey = row.original.category as MenCategoryKey
      const subcategoryValue = row.original.subcategory

      const categoriesList =
        gender === ProductGender.WOMEN
          ? WOMEN_CATEGORIES_LIST
          : MEN_CATEGORIES_LIST
      const category = categoriesList[categoryKey]
      const subcategory = category?.subcategories.find(
        (sub) => sub.value === subcategoryValue
      )

      return (
        <div className="flex flex-col">
          <span className="font-medium">{category?.name}</span>
          <span className="text-xs text-muted-foreground">
            {subcategory?.label}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const price = Number(row.getValue('price'))
      const salePrice = row.original.sale_price
        ? Number(row.original.sale_price)
        : null

      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(price)}
          </span>
          {salePrice && (
            <span className="text-xs text-green-600">
              Sale:{' '}
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(salePrice)}
            </span>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'stock_quantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    cell: ({ row }) => {
      const stockQty = row.getValue('stock_quantity') as number
      const threshold = row.original.low_stock_threshold

      let status = 'in_stock'
      if (stockQty === 0) status = 'out_of_stock'
      else if (threshold !== null && stockQty <= threshold) status = 'low_stock'

      return (
        <div className="flex flex-col">
          <Badge
            variant={
              status === 'out_of_stock'
                ? 'destructive'
                : status === 'low_stock'
                  ? 'warning'
                  : 'success'
            }
          >
            {status === 'out_of_stock'
              ? 'Out of Stock'
              : status === 'low_stock'
                ? 'Low Stock'
                : 'In Stock'}
          </Badge>
          <span className="mt-1 text-xs text-muted-foreground">
            {stockQty} units
          </span>
        </div>
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
]

export const productFilterableColumns = [
  {
    id: 'category',
    title: 'Category',
    options: [
      { value: ProductCategory.CLOTHING, label: 'Clothing' },
      { value: ProductCategory.SHOES, label: 'Shoes' },
      { value: ProductCategory.ACCESSORIES, label: 'Accessories' },
      { value: ProductCategory.DESIGNER, label: 'Designer' },
      { value: ProductCategory.STREETWEAR, label: 'Streetwear' },
      { value: ProductCategory.SPORTS, label: 'Sports' }
    ]
  },
  {
    id: 'gender',
    title: 'Gender',
    options: [
      { value: ProductGender.MEN, label: 'Men' },
      { value: ProductGender.WOMEN, label: 'Women' },
      { value: ProductGender.UNISEX, label: 'Unisex' },
      { value: ProductGender.KIDS, label: 'Kids' }
    ]
  }
]

export const productSearchableColumns = [
  {
    id: 'name',
    title: 'Product Name'
  }
]
