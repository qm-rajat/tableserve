'use client'
// app/login/page.js
import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { MdTableRestaurant } from 'react-icons/md'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const { data: session } = useSession()

  let callbackUrl = searchParams.get('callbackUrl')
  // Sanitize callbackUrl: remove accidental leading dots, normalize localhost hostnames
  if (callbackUrl) {
    // Strip leading dots which would create relative paths like '.admin'
    callbackUrl = callbackUrl.replace(/^\.+/, '')
    // If it now starts with no slash but looks like a path, ensure leading '/'
    if (!callbackUrl.startsWith('/') && callbackUrl.match(/^([a-zA-Z0-9_-]+)(\?|$)/)) {
      callbackUrl = '/' + callbackUrl
    }
  }

  // Redirect after session updates
  useEffect(() => {
    if (session?.user?.role) {
      if (callbackUrl) {
        try {
              // Handle localhost with any port
              if (callbackUrl.includes('localhost')) {
                try {
                  const url = new URL(callbackUrl)
                  if (url.origin === window.location.origin) {
                    router.push(url.pathname + url.search)
                    return
                  }
                } catch {}
              }

          const url = new URL(callbackUrl)
          if (url.origin === window.location.origin) {
            router.push(url.pathname + url.search)
            return
          }
        } catch (e) {
          if (callbackUrl.startsWith('/')) {
            router.push(callbackUrl)
            return
          }
        }
      }
      // Route based on role
      if (session.user.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/staff')
      }
    }
  }, [session?.user?.role, searchParams, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
            callbackUrl: callbackUrl || (session?.user?.role === 'ADMIN' ? '/admin' : '/staff'),
      })
      setLoading(false)
      if (res?.error) {
        toast.error('Invalid email or password')
        return
      }

      toast.success('Logged in!')

      if (res?.url) {
            let target = res.url
        try {
              const url = new URL(target)
              if (url.origin === window.location.origin) {
                router.push(url.pathname + url.search)
                return
              }
        } catch {
              // sanitize target similar to callbackUrl
              target = target.replace(/^\.+/, '')
              if (target.startsWith('/')) {
                router.push(target)
                return
              }
        }
      }

      if (session?.user?.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/staff')
      }
    } catch (err) {
      setLoading(false)
      toast.error('An unexpected error occurred')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MdTableRestaurant className="text-white text-3xl" />
          </div>
          <h1 className="text-white font-black text-2xl">TableServe</h1>
          <p className="text-stone-400 text-sm mt-1">Staff & Admin Login</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-2xl">
          {error === 'unauthorized' && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">
              You don't have permission to access that page.
            </div>
          )}

          <div className="mb-4">
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="you@tableserve.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input pr-10"
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="mt-4 p-3 bg-stone-50 rounded-xl text-xs text-stone-500">
            <p className="font-semibold mb-1">Demo accounts:</p>
            <p>Admin: admin@tableserve.com / admin123</p>
            <p>Staff: staff1@tableserve.com / staff123</p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>
}
