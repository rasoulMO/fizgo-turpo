import { Metadata } from 'next'

import { AdminNav } from './components/admin-nav'

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Check out some examples app built using the components.'
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <>
      {/* <SiteHeader /> */}
      <main id="skip" className="mx-auto min-h-screen max-w-5xl py-10">
        <AdminNav />
        {children}
      </main>
      {/* <SiteFooter /> */}
    </>
  )
}
