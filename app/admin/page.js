'use client'
// app/admin/page.js
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MdTableRestaurant } from 'react-icons/md'
import { FiList, FiUsers, FiShoppingBag, FiDollarSign } from 'react-icons/fi'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/tables').then(r => r.json()),
      fetch('/api/menu').then(r => r.json()),
      fetch('/api/staff').then(r => r.json()),
      fetch('/api/orders?limit=200').then(r => r.json()),
    ]).then(([tables, menu, staff, orders]) => {
      const today       = new Date().toDateString()
      const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today)
      const todayRevenue = todayOrders
        .filter(o => o.payment_status === 'PAID_UPI' || o.payment_status === 'PAID_OFFLINE')
        .reduce((s, o) => s + parseFloat(o.total_amount), 0)
      setStats({ tables: tables.length, menu: menu.length, staff: staff.length, todayOrders: todayOrders.length, todayRevenue })
    })
  }, [])

  const cards = [
    { label: 'Total Tables',    value: stats?.tables ?? '—',                         icon: <MdTableRestaurant />, href: '/admin/tables', color: 'bg-orange-50 text-orange-600' },
    { label: 'Menu Items',      value: stats?.menu ?? '—',                           icon: <FiList />,            href: '/admin/menu',   color: 'bg-blue-50 text-blue-600'   },
    { label: 'Staff Members',   value: stats?.staff ?? '—',                          icon: <FiUsers />,           href: '/admin/staff',  color: 'bg-purple-50 text-purple-600'},
    { label: "Today's Orders",  value: stats?.todayOrders ?? '—',                    icon: <FiShoppingBag />,     href: '/admin/orders', color: 'bg-green-50 text-green-600' },
    { label: "Today's Revenue", value: stats ? `₹${stats.todayRevenue.toFixed(0)}` : '—', icon: <FiDollarSign />, href: '/admin/orders', color: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-black text-stone-800 mb-1">Dashboard</h1>
      <p className="text-stone-500 text-sm mb-6">Welcome back, Admin</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => (
          <Link key={card.label} href={card.href} className="card hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${card.color}`}>{card.icon}</div>
            <p className="text-2xl font-black text-stone-800">{card.value}</p>
            <p className="text-sm text-stone-500 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
