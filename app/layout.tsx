import type { Metadata } from 'next'
import './globals.css'
import Vignette from './components/Vignette'

export const metadata: Metadata = {
  title: 'Book Club Platform',
  description: 'A platform for managing your book club',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Vignette />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}