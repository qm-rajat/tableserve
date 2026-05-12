// app/layout.js
import './globals.css'
import { Toaster } from 'react-hot-toast'
import SessionProvider from '@/components/SessionProvider'

export const metadata = {
  title: 'TableServe',
  description: 'Smart food ordering system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
          <Toaster position="top-center" toastOptions={{
            style: { borderRadius: '12px', fontFamily: 'inherit', fontSize: '14px' }
          }} />
        </SessionProvider>
      </body>
    </html>
  )
}
