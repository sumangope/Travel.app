import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Travel.app — Find your next stay',
  description: 'Discover thoughtfully selected hotels across Thailand.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
