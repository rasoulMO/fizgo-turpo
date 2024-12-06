'use client'

import { useState } from 'react'
import { api } from '@/trpc/react'
import {
  ConnectAccountManagement,
  ConnectAccountOnboarding,
  ConnectComponentsProvider
} from '@stripe/react-connect-js'
import { Loader2 } from 'lucide-react'

import { cn } from '@/utils/cn'
import { useStripeConnect } from '@/hooks/use-stripe-connect'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  const { toast } = useToast()
  const utils = api.useUtils()
  const [isCreating, setIsCreating] = useState(false)
  const [onboardingExited, setOnboardingExited] = useState(false)

  const { data: shop } = api.shop.getMine.useQuery()
  const stripeConnectInstance = useStripeConnect(
    shop?.stripe_account_id || undefined,
    shop?.onboarding_completed || false
  )

  const { mutate: updateStatus } = api.shop.updateStatus.useMutation({
    onSuccess: () => {
      toast({ title: 'Shop status updated' })
      utils.shop.getMine.invalidate()
    },
    onError: () => {
      toast({
        title: 'Error updating shop status',
        variant: 'destructive'
      })
    }
  })

  const { mutate: updateShop } = api.shop.update.useMutation({
    onSuccess: () => {
      utils.shop.getMine.invalidate()
    },
    onError: (error) => {
      toast({
        title: 'Error updating shop',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const createStripeAccount = async () => {
    try {
      setIsCreating(true)
      const response = await fetch('/api/stripe/account', {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create Stripe account')
      }

      const { account } = await response.json()
      utils.shop.getMine.invalidate()
    } catch (error) {
      toast({
        title: 'Error creating Stripe account',
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleOnboardingExit = () => {
    setOnboardingExited(true)
    updateShop({
      onboarding_completed: true
    })
  }

  return (
    <div className="container py-8">
      <div className="grid gap-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your shop settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shop Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-2.5 w-2.5 rounded-full',
                    shop?.status === 'ACTIVE'
                      ? 'bg-green-500'
                      : shop?.status === 'SUSPENDED'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                  )}
                />
                <p>Current status: {shop?.status}</p>
              </div>
              <Button
                disabled={shop?.status === 'ACTIVE'}
                onClick={() => updateStatus({ status: 'ACTIVE' })}
              >
                Activate Shop
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {!shop?.stripe_account_id && (
                <div className="rounded-lg border border-border bg-card p-6 text-center">
                  <h3 className="mb-2 text-lg font-semibold">
                    Connect with Stripe
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Set up your payment processing to start accepting payments
                    from customers
                  </p>
                  <Button onClick={createStripeAccount} disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Connect with Stripe'
                    )}
                  </Button>
                </div>
              )}

              {stripeConnectInstance && !shop?.onboarding_completed && (
                <div className="rounded-lg border border-border">
                  <ConnectComponentsProvider
                    connectInstance={stripeConnectInstance}
                  >
                    <div className="min-h-[600px] p-6">
                      <ConnectAccountOnboarding onExit={handleOnboardingExit} />
                    </div>
                  </ConnectComponentsProvider>
                </div>
              )}

              {shop?.onboarding_completed && stripeConnectInstance && (
                <div className="rounded-lg border border-border">
                  <ConnectComponentsProvider
                    connectInstance={stripeConnectInstance}
                  >
                    <div className="min-h-[600px] p-6">
                      <ConnectAccountManagement
                        collectionOptions={{
                          fields: 'eventually_due',
                          futureRequirements: 'include'
                        }}
                      />
                    </div>
                  </ConnectComponentsProvider>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
