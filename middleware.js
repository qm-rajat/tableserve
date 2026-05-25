import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

function getRoleFromToken(token) {
  return token?.role ?? token?.user?.role
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token
    const role = getRoleFromToken(token)

    // Admin routes — ADMIN, SUPER_ADMIN
    if (pathname.startsWith('/admin')) {
      if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
        const url = req.nextUrl.clone()
        url.pathname = '/login'
        url.search = '?error=unauthorized'
        return NextResponse.redirect(url)
      }
    }

    // Staff routes — STAFF, MANAGER, ADMIN, SUPER_ADMIN
    if (pathname.startsWith('/staff')) {
      if (!['STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
        const url = req.nextUrl.clone()
        url.pathname = '/login'
        url.search = '?error=unauthorized'
        return NextResponse.redirect(url)
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
