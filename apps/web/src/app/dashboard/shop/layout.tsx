import { Metadata } from 'next'

import { ShopNav } from './components/shop-nav'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Check out some examples app built using the components.'
}

interface ShopLayoutProps {
  children: React.ReactNode
}

export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <>
      {/* <SiteHeader /> */}
      <main id="skip" className="mx-auto min-h-screen max-w-5xl">
        <h1 className="mb-4 text-4xl font-bold">Shop Dashoard</h1>
        <ShopNav />
        {children}
      </main>
      {/* <SiteFooter /> */}
    </>
  )
}
