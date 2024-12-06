import React from 'react'
import Link from 'next/link'

import { ThemeSwitcher } from './theme-switcher'

const SiteFooter = () => {
  return (
    <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-4 text-center text-xs">
      <p>
        Powered by{' '}
        <a
          href="https://algodynamics.it"
          target="_blank"
          className="font-bold hover:underline"
          rel="noreferrer"
        >
          AlgoDynamics
        </a>
      </p>
      <Link href="/partner">Become a partner</Link>
      <Link href="/delivery-partner">Become a delivery partner</Link>
      <ThemeSwitcher />
    </footer>
  )
}

export default SiteFooter
