import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import ErrorBoundary from '@/components/error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Keyra QR - Professional QR Code Solutions',
  description: 'Generate, manage, and track QR codes for your business. Professional QR code solutions with analytics and custom designs.',
  keywords: 'QR code, generator, business, analytics, custom design, professional',
  authors: [{ name: 'Keyra QR Team' }],
  creator: 'Keyra QR',
  publisher: 'Keyra QR',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://keyra-qr.vercel.app'),
  openGraph: {
    title: 'Keyra QR - Professional QR Code Solutions',
    description: 'Generate, manage, and track QR codes for your business. Professional QR code solutions with analytics and custom designs.',
    url: 'https://keyra-qr.vercel.app',
    siteName: 'Keyra QR',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Keyra QR - Professional QR Code Solutions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Keyra QR - Professional QR Code Solutions',
    description: 'Generate, manage, and track QR codes for your business. Professional QR code solutions with analytics and custom designs.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <div className="min-h-screen bg-background">
            {children}
          </div>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}
