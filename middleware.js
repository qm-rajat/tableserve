// middleware.js
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin routes — only ADMIN role
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
      }
    }

    // Staff routes — STAFF, MANAGER, ADMIN
    if (pathname.startsWith('/staff')) {
      if (!['STAFF', 'MANAGER', 'ADMIN'].includes(token?.role)) {
        return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
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
