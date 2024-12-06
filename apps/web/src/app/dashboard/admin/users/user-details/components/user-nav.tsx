'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import { cn } from '@/utils/cn'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface UserNavProps extends React.HTMLAttributes<HTMLDivElement> {
  params: {
    id: string
  }
}

export function UserNav({ className, ...props }: UserNavProps) {
  const pathname = usePathname()
  const urlParams = useSearchParams()
  const userTabs = [
    {
      name: 'User info',
      href: '/admin/users/user-details/user-info'
    },
    {
      name: 'Invoices',
      href: '/admin/users/user-details/invoices'
    },
    {
      name: 'Clients',
      href: '/admin/users/user-details/clients'
    },
    {
      name: 'Providers',
      href: '/admin/users/user-details/providers'
    },
    {
      name: 'Notifications',
      href: '/admin/users/user-details/notifications'
    },
    {
      name: 'Family',
      href: '/admin/users/user-details/family'
    },
    {
      name: 'Foriegn assets',
      href: '/admin/users/user-details/foriegn-assets'
    },
    {
      name: 'Properties',
      href: '/admin/users/user-details/properties'
    },
    {
      name: 'Fiscal Information',
      href: '/admin/users/user-details/fiscal-information'
    },
    {
      name: 'Billing',
      href: '/admin/users/user-details/billing'
    }
  ]

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div className={cn('mb-4 flex items-center', className)} {...props}>
          {userTabs.map((userTab, index) => (
            <Link
              href={{
                pathname: userTab.href,
                query: { id: urlParams.get('id') }
              }}
              key={userTab.href}
              className={cn(
                'flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary',
                pathname?.startsWith(userTab.href) ||
                  (index === 0 && pathname === '/')
                  ? 'bg-muted font-medium text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {userTab.name}
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  )
}
