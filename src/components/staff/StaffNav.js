'use client'
// src/components/staff/StaffNav.js
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiLogOut, FiClipboard, FiClock, FiCoffee, FiChevronRight } from 'react-icons/fi'
import { MdTableRestaurant } from 'react-icons/md'

export default function StaffNav() {
  const { data: session } = useSession() || {}
  const pathname = usePathname()

  return (
    <nav className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl">
              <FiCoffee className="text-white text-xl" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-black text-xl tracking-tight leading-none block">TableServe</span>
              <span className="text-[10px] text-stone-500 font-black uppercase tracking-[0.2em] mt-1 block">Staff Portal</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link href="/staff" className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${pathname === '/staff' ? 'bg-white text-stone-900 shadow-xl' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800/50'}`}>
              <FiClipboard size={14} /> Live Orders
            </Link>
            <Link href="/staff/history" className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${pathname === '/staff/history' ? 'bg-white text-stone-900 shadow-xl' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800/50'}`}>
              <FiClock size={14} /> History
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Authenticated as</span>
            <span className="text-xs font-bold text-white">{session?.user?.name || 'Staff User'}</span>
          </div>

          <div className="flex items-center gap-2">
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin" className="flex items-center gap-2 h-10 px-4 bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                Admin Panel <FiChevronRight />
              </Link>
            )}
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })} 
              className="flex items-center justify-center w-10 h-10 bg-stone-800 hover:bg-red-500 hover:text-white rounded-2xl text-stone-400 transition-all"
              title="Sign out"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
