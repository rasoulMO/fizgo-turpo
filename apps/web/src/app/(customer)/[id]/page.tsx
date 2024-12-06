import { notFound } from 'next/navigation'
import { api } from '@/trpc/server'

import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'

import { ProductDetail } from '../components/product-detail'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const supabase = useSupabaseServer()
  const user = await checkAuth(supabase)

  const product = await api.product.getById(params.id)

  if (!product) {
    return notFound()
  }

  const isLiked = product.likes.some((like) => like.user_id === user.id)

  return (
    <div className="container mx-auto py-8">
      <ProductDetail
        product={{
          ...product,
          specifications: product.specifications ? product.specifications : null
        }}
        initialLikeCount={product.likes.length}
        initialIsLiked={isLiked}
        userId={user.id}
      />
    </div>
  )
}
