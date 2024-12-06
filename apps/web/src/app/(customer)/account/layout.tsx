'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CreditCard,
  Heart,
  MapPin,
  MessageSquare,
  Package,
  Settings,
  Shirt,
  User
} from 'lucide-react'

import { cn } from '@/utils/cn'
import { ROUTES } from '@/utils/paths'
import { Button } from '@/components/ui/button'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: ROUTES.CUSTOMER_PROFILE,
    icon: <User className="h-4 w-4" />
  },
  {
    title: 'Favorites',
    href: ROUTES.CUSTOMER_FAVORITES,
    icon: <Heart className="h-4 w-4" />
  },
  {
    title: 'Orders',
    href: ROUTES.CUSTOMER_ORDERS,
    icon: <Package className="h-4 w-4" />
  },
  {
    title: 'Messages',
    href: ROUTES.CUSTOMER_MESSAGES,
    icon: <MessageSquare className="h-4 w-4" />
  },
  {
    title: 'Items',
    href: ROUTES.CUSTOMER_ITEMS,
    icon: <Shirt className="h-4 w-4" />
  },
  {
    title: 'Addresses',
    href: ROUTES.CUSTOMER_ADDRESSES,
    icon: <MapPin className="h-4 w-4" />
  },
  {
    title: 'Payment Methods',
    href: ROUTES.CUSTOMER_PAYMENTS,
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    title: 'Settings',
    href: ROUTES.CUSTOMER_SETTINGS,
    icon: <Settings className="h-4 w-4" />
  }
]

interface AccountLayoutProps {
  children: React.ReactNode
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="container max-w-6xl space-y-8 py-10">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {sidebarNavItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className={cn(
                  'justify-start',
                  pathname === item.href && 'bg-muted'
                )}
                asChild
              >
                <Link href={item.href}>
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </Link>
              </Button>
            ))}
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
