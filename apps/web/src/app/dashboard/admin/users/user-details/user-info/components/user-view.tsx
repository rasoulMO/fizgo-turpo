import React from 'react'

import { Database } from '@/types/database'

type userViewProps = {
  userDetails: Database['public']['Tables']['users']['Row'] | null
}

function UserView({ userDetails }: userViewProps) {
  return (
    <div>
      <p>Full name: {userDetails?.full_name}</p>
      <p>Email: {userDetails?.email}</p>
      <p>Role: {userDetails?.role}</p>
    </div>
  )
}

export default UserView
