'use client'
'// app/login/page.js'
import { useState, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MdTableRestaurant } from 'react-icons/md'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'

function LoginForm() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const error        = searchParams.get('error')
  const { data: session } = useSession()

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (!session?.user) return
    const callback = searchParams.get('callbackUrl')
    if (callback) {
      try {
        const url = new URL(callback)
        if (url.origin === window.location.origin) {
          router.push(url.pathname + url.search)
          return
        }
      } catch {
        if (callback.startsWith('/')) {
          router.push(callback)
          return
        }
      }
    }

    if (session.user.role === 'ADMIN') router.push('/admin')
    else router.push('/staff')
  }, [session, router, searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (!res || res.error) {
      toast.error('Invalid email or password')
      return
    }

    // Fetch session to get role, then redirect accordingly
    const sessionRes = await fetch('/api/auth/session')
    const session    = await sessionRes.json()

    if (session?.user?.role === 'ADMIN') {
      router.push('/admin')
    } else {
      router.push('/staff')
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
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-60"
          >
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