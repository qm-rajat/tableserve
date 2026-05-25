// middleware.js
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin routes — ADMIN only
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.search = '?error=unauthorized'
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Return true = let middleware function above handle it
      // Return false = redirect to login page (set in authOptions pages.signIn)
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        if (pathname.startsWith('/staff') || pathname.startsWith('/admin')) {
          return !!token
        }
        return true
      }
    }
  }
)

export const config = {
  matcher: ['/staff/:path*', '/admin/:path*']
}