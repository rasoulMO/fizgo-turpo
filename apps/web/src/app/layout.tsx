import '@/styles/globals.css'

import { type Metadata } from 'next'
import { TRPCReactProvider } from '@/trpc/react'
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from 'next-themes'

import { Toaster } from '@/components/ui/toaster'
import SiteFooter from '@/components/site-footer'
import SiteHeader from '@/components/site-header'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Fizgo AI',
  description: 'The best app',
  icons: [{ rel: 'icon', url: '/favicon.ico' }]
}

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <SiteHeader />
            <main id="skip" className="mx-auto min-h-screen max-w-5xl py-10">
              {children}
            </main>
            <SiteFooter />
          </TRPCReactProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
