import { api } from '@/trpc/server'

import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'

import PaymentsPage from './payments-page'

export const metadata = {
  title: 'Payment Methods',
  description: 'Manage your payment methods'
}

export default async function PaymentsSettingsPage() {
  const supabase = useSupabaseServer()
  await checkAuth(supabase)
  const paymentMethods = await api.payment.getAllPaymentMethods()

  return <PaymentsPage initialPaymentMethods={paymentMethods} />
}
