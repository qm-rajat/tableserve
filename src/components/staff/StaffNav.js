'use client'
// src/components/staff/StaffNav.js
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MdTableRestaurant } from 'react-icons/md'
import { FiLogOut, FiClipboard, FiClock } from 'react-icons/fi'

export default function StaffNav() {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <nav className="bg-stone-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MdTableRestaurant className="text-orange-400 text-xl" />
            <span className="font-bold">TableServe</span>
            <span className="text-stone-500 text-xs">Staff</span>
          </div>
          <div className="flex gap-1 ml-4">
            <Link href="/staff" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/staff' ? 'bg-stone-700 text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}>
              <FiClipboard className="text-xs" /> Live Orders
            </Link>
            <Link href="/staff/history" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/staff/history' ? 'bg-stone-700 text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}>
              <FiClock className="text-xs" /> History
            </Link>
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-orange-400 hover:bg-stone-800">
                Admin Panel
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-400 hidden sm:block">{session?.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-stone-800">
            <FiLogOut /> Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
