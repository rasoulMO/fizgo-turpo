'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/utils/cn'
import { ROUTES } from '@/utils/paths'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

const adminTabs = [
  {
    name: 'Users',
    href: ROUTES.ADMIN_USERS
  },
  {
    name: 'Shops',
    href: ROUTES.ADMIN_SHOPS
  },
  {
    name: 'Partners',
    href: ROUTES.ADMIN_PARTNERS
  },
  {
    name: 'Delivery Partners',
    href: ROUTES.ADMIN_DELIVERY_PARTNERS
  },
  {
    name: 'Orders',
    href: ROUTES.ADMIN_OERDERS
  },
  {
    name: 'Deliveries',
    href: ROUTES.ADMIN_DELIVERIES
  },
  {
    name: 'Contacts',
    href: ROUTES.ADMIN_CONTACTS
  },
  {
    name: 'Tasks',
    href: ROUTES.ADMIN_TASKS
  },
  {
    name: 'Notifications',
    href: ROUTES.ADMIN_NOTIFICATIONS
  },
  {
    name: 'Subscriptions',
    href: ROUTES.ADMIN_SUBSCRIPTIONS
  }
]

interface AdminNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminNav({ className, ...props }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div className={cn('mb-4 flex items-center', className)} {...props}>
          {adminTabs.map((adminTab, index) => (
            <Link
              href={adminTab.href}
              key={adminTab.href}
              className={cn(
                'flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary',
                pathname?.startsWith(adminTab.href) ||
                  (index === 0 && pathname === '/')
                  ? 'bg-muted font-medium text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {adminTab.name}
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  )
}
