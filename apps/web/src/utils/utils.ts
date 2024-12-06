import { redirect } from 'next/navigation'
import { db } from '@/server/db'
import { TypedSupabaseClient } from '@/types'
import { UserRole } from '@prisma/client'

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: 'error' | 'success',
  path: string,
  message: string
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`)
}

// Add this to your existing middleware
const routePermissions = new Map([
  ['/dashboard/admin', UserRole.ADMIN],
  ['/dashboard/shop', UserRole.SHOP_OWNER],
  ['/dashboard/delivery', UserRole.DELIVERY_PARTNER],
  ['/dashboard/operator', UserRole.INTERNAL_OPERATOR]
])

export const roleHierarchy = {
  [UserRole.CUSTOMER]: 0,
  [UserRole.SHOP_OWNER]: 1,
  [UserRole.DELIVERY_PARTNER]: 2,
  [UserRole.INTERNAL_OPERATOR]: 3,
  [UserRole.ADMIN]: 4,
  [UserRole.SUPER_ADMIN]: 5
} as const

function getRequiredRoleForPath(path: string): UserRole | null {
  for (const [route, role] of routePermissions) {
    if (path.startsWith(route)) {
      return role
    }
  }
  return null
}

export function hasPermission(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export async function checkAuth(client: TypedSupabaseClient, path?: string) {
  const {
    data: { user }
  } = await client.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  if (path) {
    const requiredRole = getRequiredRoleForPath(path)

    if (requiredRole) {
      const dbUser = await db.users.findUnique({
        where: { id: user.id },
        select: { role: true }
      })

      if (!dbUser || !hasPermission(dbUser.role, requiredRole)) {
        redirect('/unauthorized')
      }
    }
  }

  return user
}
