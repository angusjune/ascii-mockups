import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ASCII Mockups',
  description: 'Build ASCII-character mockups you can copy and paste anywhere.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-parchment text-near-black antialiased">{children}</body>
    </html>
  )
}
