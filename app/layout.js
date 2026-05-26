import './globals.css'
import { Providers } from './providers'
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: 'TableServe',
  description: 'Order at your table with TableServe',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', rel: 'icon' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192', rel: 'icon' },
      { url: '/android-chrome-512x512.png', type: 'image/png', sizes: '512x512', rel: 'icon' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', rel: 'apple-touch-icon' }],
  },
}

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
