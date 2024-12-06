import Link from 'next/link'
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

import { ROUTES } from '@/utils/paths'
import { useSupabaseServer } from '@/utils/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { signOutAction } from '@/app/(auth-pages)/actions'

const userNavItems = [
  {
    title: 'Profile',
    href: ROUTES.CUSTOMER_PROFILE,
    icon: <User className="mr-2 h-4 w-4" />,
    shortcut: '⇧⌘P'
  },
  {
    title: 'Favorites',
    href: ROUTES.CUSTOMER_FAVORITES,
    icon: <Heart className="mr-2 h-4 w-4" />,
    shortcut: '⇧⌘F'
  },
  {
    title: 'Orders',
    href: ROUTES.CUSTOMER_ORDERS,
    icon: <Package className="mr-2 h-4 w-4" />,
    shortcut: '⇧⌘O'
  },
  {
    title: 'Messages',
    href: ROUTES.CUSTOMER_MESSAGES,
    icon: <MessageSquare className="mr-2 h-4 w-4" />,
    shortcut: '⇧⌘M'
  },
  {
    title: 'Items',
    href: '/account/items',
    icon: <Shirt className="mr-2 h-4 w-4" />,
    shortcut: '⇧⌘I'
  },
  {
    title: 'Addresses',
    href: ROUTES.CUSTOMER_ADDRESSES,
    icon: <MapPin className="mr-2 h-4 w-4" />,
    shortcut: '⇧⌘A'
  },
  {
    title: 'Payment Methods',
    href: ROUTES.CUSTOMER_PAYMENTS,
    icon: <CreditCard className="mr-2 h-4 w-4" />,
    shortcut: '⌘P'
  },
  {
    title: 'Settings',
    href: ROUTES.CUSTOMER_SETTINGS,
    icon: <Settings className="mr-2 h-4 w-4" />,
    shortcut: '⌘S'
  }
]

export async function UserNav() {
  const {
    data: { user }
  } = await useSupabaseServer().auth.getUser()

  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="" />
            <AvatarFallback>F</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {userNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <DropdownMenuItem>
                {item.icon}
                {item.title}
                <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" className="w-full">
            Sign out
          </Button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  )
}
