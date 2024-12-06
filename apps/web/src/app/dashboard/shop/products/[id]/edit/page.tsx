import { notFound } from 'next/navigation'
import { api } from '@/trpc/server'

import { EditProductForm } from '../../components/edit-product-form'

export default async function EditProductPage({
  params
}: {
  params: { id: string }
}) {
  const product = await api.product.getById(params.id)

  if (!product) {
    notFound()
  }

  // Ensure images is always an array
  const normalizedProduct = {
    ...product,
    images: Array.isArray(product.images) ? product.images : [],
    shop: product.shop || {
      address: '',
      id: '',
      name: '',
      description: null,
      status: 'ACTIVE', // or any default status
      created_at: null,
      updated_at: null,
      owner_id: null,
      coordinates: {},
      phone: null,
      business_hours: {},
      logo_url: null,
      stripe_account_id: '',
      stripe_account_status: 'PENDING',
      onboarding_completed: false
    },
    specifications: product.specifications
      ? {
          ...product.specifications
        }
      : undefined
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Update your product details</p>
      </div>

      <EditProductForm product={normalizedProduct} />
    </div>
  )
}
