import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.split('=')
      return [k.trim(), decodeURIComponent((v || []).join('='))]
    })
  )
}

export async function GET(req) {
  // Protection: in production require a debug key to avoid exposing info publicly
  const url = new URL(req.url)
  const providedKey = url.searchParams.get('key')
  const debugKey = process.env.NEXTAUTH_DEBUG_KEY || process.env.DEBUG_KEY

  if (process.env.NODE_ENV === 'production' && debugKey) {
    if (!providedKey || providedKey !== debugKey) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const headers = Object.fromEntries(req.headers.entries())
  const cookieHeader = headers.cookie || headers.Cookie || ''
  const cookies = parseCookies(cookieHeader)

  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch (e) {
    // ignore
  }

  const result = {
    ok: true,
    timestamp: new Date().toISOString(),
    headers: {
      // include common headers only to keep output small
      host: headers.host || null,
      origin: headers.origin || null,
      referer: headers.referer || headers.referrer || null,
      cookie: !!cookieHeader,
      'user-agent': headers['user-agent'] || null,
    },
    cookies,
    session: session ? { user: session.user, expires: session.expires } : null,
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
      NEXTAUTH_SECRET_PRESENT: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_DEBUG_KEY_PRESENT: !!debugKey,
      NODE_ENV: process.env.NODE_ENV || null,
    }
  }

  return NextResponse.json(result)
}
