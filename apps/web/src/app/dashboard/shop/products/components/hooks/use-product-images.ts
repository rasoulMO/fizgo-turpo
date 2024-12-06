// hooks/use-product-images.ts
import { useState } from 'react'

import { createStoragePath, createUniqueFileName } from '@/utils/storage'
import useSupabaseBrowser from '@/utils/supabase/client'

export function useProductImages(folder: 'products' | 'items') {
  const supabase = useSupabaseBrowser()
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  const uploadImages = async (shopId: string, files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      const fileName = createUniqueFileName(file.name)
      const storagePath = createStoragePath({
        access: 'public',
        folder: folder,
        userId: shopId, // Pass the shop ID as userId
        fileName
      })

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      return supabase.storage.from('products').getPublicUrl(storagePath).data
        .publicUrl
    })

    return Promise.all(uploadPromises)
  }

  return {
    pendingFiles,
    setPendingFiles,
    uploadImages
  }
}
