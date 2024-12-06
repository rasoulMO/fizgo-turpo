import { SupabaseClient } from '@supabase/supabase-js'

import { createStoragePath, createUniqueFileName } from '../storage'

export async function uploadAvatar(client: SupabaseClient, file: File) {
  const {
    data: { user }
  } = await client.auth.getUser()
  if (!user) throw new Error('User not found')

  const fileName = createUniqueFileName(file.name)
  const storagePath = createStoragePath({
    access: 'public',
    folder: 'avatars',
    userId: user.id,
    fileName
  })

  const { error: uploadError } = await client.storage
    .from('avatars')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (uploadError) throw uploadError

  return client.storage.from('avatars').getPublicUrl(storagePath).data.publicUrl
}

export async function uploadItemImage(
  client: SupabaseClient,
  file: File,
  itemId: string
) {
  const {
    data: { user }
  } = await client.auth.getUser()
  if (!user) throw new Error('User not found')

  const fileName = createUniqueFileName(file.name)
  const storagePath = createStoragePath({
    access: 'public',
    folder: 'items',
    userId: user.id,
    subfolder: itemId,
    fileName
  })

  const { error: uploadError } = await client.storage
    .from('items')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) throw uploadError

  return client.storage.from('items').getPublicUrl(storagePath).data.publicUrl
}

export async function uploadPrivateDocument(
  client: SupabaseClient,
  file: File,
  documentType: string
) {
  const {
    data: { user }
  } = await client.auth.getUser()
  if (!user) throw new Error('User not found')

  const fileName = createUniqueFileName(file.name)
  const storagePath = createStoragePath({
    access: 'private',
    folder: 'documents',
    userId: user.id,
    subfolder: documentType,
    fileName
  })

  const { error: uploadError } = await client.storage
    .from('documents')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) throw uploadError

  return storagePath // For private files, we might not want to return a public URL
}
