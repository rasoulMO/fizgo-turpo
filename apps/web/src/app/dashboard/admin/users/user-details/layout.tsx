import { Metadata } from 'next'

import UserDetailBreadcrumb from './components/user-detail-breadcrumb'
import { UserNav } from './components/user-nav'

export const metadata: Metadata = {
  title: 'Admin - User Details',
  description: 'Check out some examples app built using the components.'
}

interface AdminLayoutProps {
  children: React.ReactNode
  params: {
    id: string
  }
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
  return (
    <div className="relative">
      <section>
        <UserDetailBreadcrumb />
        <UserNav params={params} />
        <div className="overflow-hidden">{children}</div>
      </section>
    </div>
  )
}
