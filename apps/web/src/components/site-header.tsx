import React from 'react'
import Link from 'next/link'

import { CartButton } from './cart/cart-button'
import { UserNav } from './user-nav'

const SiteHeader = () => {
  return (
    <header>
      <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
        <div className="flex w-full max-w-5xl items-center justify-between py-3 text-sm">
          <div className="flex items-center gap-5 font-semibold">
            <Link href={'/'}>Fizgo.ai</Link>
            <Link href={'/items'}>Items</Link>
          </div>
          <div className="flex items-center gap-4">
            <CartButton />
            <UserNav />
          </div>
        </div>
      </nav>
    </header>
  )
}

export default SiteHeader
