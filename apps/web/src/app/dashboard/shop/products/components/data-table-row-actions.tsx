'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { products } from '@prisma/client'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { DeleteProductDialog } from './dialogs/delete-product-dialog'
import { UpdateStockDialog } from './dialogs/update-stock-dialog'
import { UpdateThresholdDialog } from './dialogs/update-threshold-dialog'
import { useProductMutations } from './hooks/use-product-mutations'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row
}: DataTableRowActionsProps<TData>) {
  const router = useRouter()
  const product = row.original as products

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showStockDialog, setShowStockDialog] = useState(false)
  const [showThresholdDialog, setShowThresholdDialog] = useState(false)
  const [quantityToAdd, setQuantityToAdd] = useState(0)
  const [newThreshold, setNewThreshold] = useState(product.low_stock_threshold)

  const { deleteProduct, updateStock, updateThreshold, toggleAvailability } =
    useProductMutations()

  const handleDelete = async () => {
    await deleteProduct.mutateAsync({ id: product.id })
    setShowDeleteDialog(false)
  }

  const handleUpdateStock = async () => {
    const newQuantity = product.stock_quantity + quantityToAdd
    if (newQuantity < 0) return

    await updateStock.mutateAsync({
      id: product.id,
      quantity: newQuantity
    })
    setShowStockDialog(false)
  }

  const handleUpdateThreshold = async () => {
    await updateThreshold.mutateAsync({
      id: product.id,
      threshold: newThreshold ?? 0
    })
    setShowThresholdDialog(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() =>
              router.push(`/dashboard/shop/products/${product.id}/edit`)
            }
          >
            Edit product
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setQuantityToAdd(0)
              setShowStockDialog(true)
            }}
          >
            Update Stock
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setNewThreshold(product.low_stock_threshold)
              setShowThresholdDialog(true)
            }}
          >
            Set Threshold
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => toggleAvailability.mutate({ id: product.id })}
          >
            {product.is_available ? 'Hide product' : 'Show product'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteProductDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />

      <UpdateStockDialog
        open={showStockDialog}
        onOpenChange={setShowStockDialog}
        currentStock={product.stock_quantity}
        quantityToAdd={quantityToAdd}
        onQuantityChange={setQuantityToAdd}
        onConfirm={handleUpdateStock}
      />

      <UpdateThresholdDialog
        open={showThresholdDialog}
        onOpenChange={setShowThresholdDialog}
        currentThreshold={product.low_stock_threshold ?? 0}
        newThreshold={newThreshold ?? 0}
        onThresholdChange={setNewThreshold}
        onConfirm={handleUpdateThreshold}
      />
    </>
  )
}
