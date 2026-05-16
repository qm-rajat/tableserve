'use client'
// src/components/admin/AdminNav.js
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { FiGrid, FiList, FiTag, FiUsers, FiCreditCard, FiClipboard, FiLogOut, FiEye, FiCoffee, FiChevronRight } from 'react-icons/fi'
import { MdTableRestaurant } from 'react-icons/md'

const links = [
  { href: '/admin', label: 'Dashboard', icon: <FiGrid size={18} /> },
  { href: '/admin/tables', label: 'Tables', icon: <MdTableRestaurant size={18} /> },
  { href: '/admin/menu', label: 'Menu Items', icon: <FiList size={18} /> },
  { href: '/admin/categories', label: 'Categories', icon: <FiTag size={18} /> },
  { href: '/admin/staff', label: 'Staff Team', icon: <FiUsers size={18} /> },
  { href: '/admin/upi', label: 'UPI Settings', icon: <FiCreditCard size={18} /> },
  { href: '/admin/orders', label: 'Global Orders', icon: <FiClipboard size={18} /> },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <aside className="w-64 bg-stone-900 text-white flex flex-col min-h-screen shrink-0 border-r border-stone-800">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-orange-500 p-2 rounded-xl">
             <FiCoffee className="text-white text-xl" />
          </div>
          <div>
            <span className="font-display font-black text-xl tracking-tight leading-none block">TableServe</span>
            <span className="text-[10px] text-stone-500 font-black uppercase tracking-[0.2em] mt-1 block">Management</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {links.map(l => {
          const isActive = pathname === l.href
          return (
            <Link key={l.href} href={l.href}
              className={`flex items-center justify-between group px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' 
                  : 'text-stone-500 hover:text-white hover:bg-stone-800/50'
              }`}>
              <div className="flex items-center gap-3">
                <span className={`${isActive ? 'text-white' : 'text-stone-600 group-hover:text-orange-400'} transition-colors`}>{l.icon}</span>
                {l.label}
              </div>
              {isActive && <FiChevronRight className="opacity-40" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 space-y-2 mb-4">
        <div className="h-[1px] bg-stone-800 mx-4 mb-4" />
        <Link href="/staff" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-stone-500 hover:bg-stone-800/50 hover:text-white transition-all">
          <FiEye className="text-stone-600" /> Staff View
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-stone-500 hover:bg-red-500/10 hover:text-red-400 transition-all">
          <FiLogOut className="text-red-500/50" /> Sign Out
        </button>
      </div>
    </aside>
  )
}
