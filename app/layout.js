import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'TableServe',
  description: 'Order at your table with TableServe',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
