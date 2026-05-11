'use client'
// src/components/admin/AdminNav.js
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { MdTableRestaurant } from 'react-icons/md'
import { FiGrid, FiList, FiTag, FiUsers, FiCreditCard, FiClipboard, FiLogOut, FiEye } from 'react-icons/fi'

const links = [
  { href: '/admin', label: 'Dashboard', icon: <FiGrid /> },
  { href: '/admin/tables', label: 'Tables', icon: <MdTableRestaurant /> },
  { href: '/admin/menu', label: 'Menu Items', icon: <FiList /> },
  { href: '/admin/categories', label: 'Categories', icon: <FiTag /> },
  { href: '/admin/staff', label: 'Staff', icon: <FiUsers /> },
  { href: '/admin/upi', label: 'UPI Settings', icon: <FiCreditCard /> },
  { href: '/admin/orders', label: 'Order Log', icon: <FiClipboard /> },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <aside className="w-56 bg-stone-900 text-white flex flex-col min-h-screen shrink-0">
      <div className="p-5 border-b border-stone-800">
        <div className="flex items-center gap-2 mb-1">
          <MdTableRestaurant className="text-orange-400 text-xl" />
          <span className="font-bold">TableServe</span>
        </div>
        <span className="text-xs text-stone-500">Admin Panel</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === l.href ? 'bg-orange-500 text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
            }`}>
            <span className="text-base">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-stone-800 space-y-1">
        <Link href="/staff" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-stone-400 hover:bg-stone-800 hover:text-white">
          <FiEye /> Staff View
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-stone-400 hover:bg-stone-800 hover:text-red-400">
          <FiLogOut /> Sign Out
        </button>
      </div>
    </aside>
  )
}
