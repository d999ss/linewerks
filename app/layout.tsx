import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Linewerks - Create Beautiful Ride Posters',
  description: 'Transform your Strava rides into stunning posters',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}