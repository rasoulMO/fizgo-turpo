import { useEffect, useState } from 'react'
import { loadConnectAndInitialize } from '@stripe/connect-js'

const appearance = {
  variables: {
    // Core theme colors
    colorPrimary: 'hsl(var(--primary))',
    colorBackground: 'hsl(var(--background))',
    colorText: 'hsl(var(--foreground))',
    colorDanger: 'hsl(var(--destructive))',

    // Typography
    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
    fontSizeBase: '14px',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    fontWeightBold: '600',

    // Spacing and layout
    borderRadius: 'var(--radius)',
    spacingUnit: '4px',
    spacingTab: '8px',

    // Focus states
    focusOutline: 'hsl(var(--ring))',
    focusBoxShadow: '0 0 0 2px hsl(var(--ring) / 0.2)'
  },
  rules: {
    // Input fields styling
    '.Input': {
      backgroundColor: 'hsl(var(--muted))',
      border: '1px solid hsl(var(--border))',
      transition: 'border-color 0.2s ease',
      '&:hover': {
        borderColor: 'hsl(var(--ring))'
      },
      '&:focus': {
        borderColor: 'hsl(var(--ring))',
        boxShadow: 'var(--focus-box-shadow)'
      }
    },

    // Tab styling
    '.Tab': {
      backgroundColor: 'transparent',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'var(--radius)',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'hsl(var(--accent))'
      }
    },
    '.Tab--selected': {
      backgroundColor: 'hsl(var(--accent))',
      borderColor: 'hsl(var(--ring))',
      color: 'hsl(var(--accent-foreground))'
    },

    // Button styling
    '.Button': {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      borderRadius: 'var(--radius)',
      border: 'none',
      padding: '8px 16px',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'hsl(var(--primary) / 0.9)'
      },
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed'
      }
    },

    // Section containers
    '.Section': {
      borderRadius: 'var(--radius)',
      padding: '16px',
      backgroundColor: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))'
    },

    // Error messages
    '.Error': {
      color: 'hsl(var(--destructive))',
      fontSize: '14px',
      marginTop: '4px'
    }
  }
}

export const useStripeConnect = (
  connectedAccountId: string | undefined,
  isManagement: boolean = false
) => {
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null)

  useEffect(() => {
    if (!connectedAccountId) {
      return
    }

    const fetchClientSecret = async () => {
      const response = await fetch('/api/stripe/account-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account: connectedAccountId,
          isManagement
        })
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(`An error occurred: ${error}`)
      }

      const { client_secret: clientSecret } = await response.json()
      return clientSecret
    }

    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
    }

    const initStripeConnect = async () => {
      try {
        const instance = await loadConnectAndInitialize({
          publishableKey,
          fetchClientSecret,
          appearance
        })
        setStripeConnectInstance(instance)
      } catch (error) {
        console.error('Failed to initialize Stripe Connect:', error)
      }
    }

    initStripeConnect()
  }, [connectedAccountId, isManagement])

  return stripeConnectInstance
}

export default useStripeConnect
