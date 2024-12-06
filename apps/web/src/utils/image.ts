export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder-avatar.png'

  // If the path is already a full URL, return it
  if (path.startsWith('http')) {
    return path
  }

  // Get the Supabase URL from environment variable
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not defined')
    return '/placeholder-avatar.png'
  }

  // If it's a Supabase storage path, construct the full URL
  if (path.startsWith('/')) {
    return `${supabaseUrl}/storage/v1/object/public${path}`
  }

  return `${supabaseUrl}/storage/v1/object/public/${path}`
}

export function getAvatarUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder-avatar.png'

  // Handle different avatar URL formats
  if (
    path.startsWith('https://avatars.githubusercontent.com') ||
    path.startsWith('https://lh3.googleusercontent.com')
  ) {
    return path
  }

  return getImageUrl(path)
}
