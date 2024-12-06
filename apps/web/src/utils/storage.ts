export type StorageAccess = 'public' | 'private'
export type StorageFolder =
  | 'avatars'
  | 'items'
  | 'messages'
  | 'documents'
  | 'products'

interface StoragePathOptions {
  access: StorageAccess
  folder: StorageFolder
  userId: string
  subfolder?: string
  fileName: string
}

/**
 * Generates a standardized storage path for files
 * Format: bucketName/access/folder/userId/[subfolder]/fileName
 */
export function createStoragePath({
  access,
  folder,
  userId,
  subfolder,
  fileName
}: StoragePathOptions): string {
  const parts = [access, folder, userId]
  if (subfolder) {
    parts.push(subfolder)
  }
  parts.push(fileName)
  return parts.join('/')
}

/**
 * Generates a unique file name with timestamp and original extension
 */
export function createUniqueFileName(originalName: string): string {
  const fileExt = originalName.split('.').pop() || ''
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}_${random}.${fileExt}`
}
