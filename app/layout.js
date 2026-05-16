import './globals.css'

export const metadata = {
  title: 'TableServe',
  description: 'Order at your table with TableServe',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
