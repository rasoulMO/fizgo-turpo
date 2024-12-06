// hooks/use-product-mutations.ts
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'

import { useToast } from '@/hooks/use-toast'

export function useProductMutations() {
  const router = useRouter()
  const { toast } = useToast()

  const deleteProduct = api.product.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      })
      router.refresh()
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete product'
      })
    }
  })

  const updateStock = api.product.updateStock.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Stock quantity updated successfully'
      })
      router.refresh()
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update stock'
      })
    }
  })

  const updateThreshold = api.product.updateThreshold.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Low stock threshold updated successfully'
      })
      router.refresh()
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update threshold'
      })
    }
  })

  const toggleAvailability = api.product.toggleAvailability.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: `Product ${
          data.is_available ? 'made available' : 'hidden'
        } successfully`
      })
      router.refresh()
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update availability'
      })
    }
  })

  const updateProduct = api.product.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Product updated successfully.'
      })
      router.push('/dashboard/shop/products')
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update product'
      })
    }
  })

  const updateSpecifications = api.productSpecifications.update.useMutation({
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update specifications'
      })
    }
  })

  return {
    deleteProduct,
    updateStock,
    updateThreshold,
    toggleAvailability,
    updateProduct,
    updateSpecifications
  }
}
