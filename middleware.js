// middleware.js
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

function getRoleFromToken(token) {
  // next-auth middleware exposes decoded JWT as `token`.
  // Depending on version/config, role might be under different keys.
  return token?.role ?? token?.user?.role
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token
    const role = getRoleFromToken(token)

    // Admin routes — ADMIN role only
    if (pathname.startsWith('/admin')) {
      if (role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
      }
    }

    // Staff routes — STAFF, MANAGER, ADMIN
    if (pathname.startsWith('/staff')) {
      if (!['STAFF', 'MANAGER', 'ADMIN'].includes(role)) {
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
  matcher: ['/staff/:path*', '/admin/:path*', '/staff', '/admin']
}

