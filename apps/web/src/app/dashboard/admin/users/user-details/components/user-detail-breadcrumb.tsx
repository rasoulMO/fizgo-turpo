'use client'

import React from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { ROUTES } from '@/utils/paths'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

export default function UserDetailBreadcrumb() {
  const searchParams = useSearchParams()
  const path = usePathname()
  const id = searchParams.get('id')

  const getPathSegmentsAfterUserDetails = (path: string) => {
    const segments = path.split('user-details/')[1]?.split('/') || []
    return segments.filter((segment) => segment !== '')
  }

  const formatLabel = (segment: string) => {
    return segment.replace(/-/g, ' ')
  }

  const pathSegments = getPathSegmentsAfterUserDetails(path)

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={ROUTES.ADMIN_USERS}>Users</BreadcrumbLink>
        </BreadcrumbItem>
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1
          return (
            <React.Fragment key={segment}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={
                    ROUTES.ADMIN_USERS +
                    `/user-details/${pathSegments.slice(0, index + 1).join('/')}?id=${id as string}`
                  }
                  className={`capitalize ${
                    isLast
                      ? 'pointer-events-none font-semibold text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {formatLabel(segment)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
