'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/utils/cn'
import { ROUTES } from '@/utils/paths'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

const shopTabs = [
  {
    name: 'Overview',
    href: ROUTES.SHOP_OVERVIEW
  },
  {
    name: 'Products',
    href: ROUTES.SHOP_PRODUCTS
  },
  {
    name: 'Orders',
    href: ROUTES.SHOP_ORDERS
  },
  {
    name: 'Deliveries',
    href: ROUTES.SHOP_DELIVERIES
  },
  {
    name: 'Customer Interactions',
    href: ROUTES.SHOP_INTERACTIONS
  },
  {
    name: 'Promotions & Marketing',
    href: ROUTES.SHOP_PROMOTIONS
  },
  {
    name: 'Notifications',
    href: ROUTES.SHOP_NOTIFICATIONS
  },
  {
    name: 'Settings',
    href: ROUTES.SHOP_SETTINGS
  }
]

interface ShopNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ShopNav({ className, ...props }: ShopNavProps) {
  const pathname = usePathname()

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div className={cn('mb-4 flex items-center', className)} {...props}>
          {shopTabs.map((shopTab, index) => (
            <Link
              href={shopTab.href}
              key={shopTab.href}
              className={cn(
                'flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary',
                pathname?.startsWith(shopTab.href) ||
                  (index === 0 && pathname === '/')
                  ? 'bg-muted font-medium text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {shopTab.name}
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  )
}
