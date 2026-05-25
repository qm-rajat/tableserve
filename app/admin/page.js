// app/admin/page.js — Admin Dashboard
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ tables: 0, categories: 0, menu: 0, staff: 0, orders: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [tRes, cRes, mRes, sRes, oRes] = await Promise.all([
          fetch('/api/tables'),
          fetch('/api/categories'),
          fetch('/api/menu'),
          fetch('/api/staff'),
          fetch('/api/orders')
        ])
        const [tables, categories, menu, staff, orders] = await Promise.all([tRes.json(), cRes.json(), mRes.json(), sRes.json(), oRes.json()])
        setCounts({ tables: tables.length || 0, categories: categories.length || 0, menu: menu.length || 0, staff: staff.length || 0, orders: orders.length || 0 })
      } catch (err) {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main className="p-8 flex-1 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-stone-800">Admin Dashboard</h1>
          <p className="text-stone-500 text-sm">Dashboard overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/tables" className="card p-6 hover:shadow-lg">
          <div className="text-sm text-stone-500">Tables</div>
          <div className="text-2xl font-black mt-2">{loading ? '…' : counts.tables}</div>
        </Link>
        <Link href="/admin/menu" className="card p-6 hover:shadow-lg">
          <div className="text-sm text-stone-500">Menu Items</div>
          <div className="text-2xl font-black mt-2">{loading ? '…' : counts.menu}</div>
        </Link>
        <Link href="/admin/categories" className="card p-6 hover:shadow-lg">
          <div className="text-sm text-stone-500">Categories</div>
          <div className="text-2xl font-black mt-2">{loading ? '…' : counts.categories}</div>
        </Link>
        <Link href="/admin/staff" className="card p-6 hover:shadow-lg">
          <div className="text-sm text-stone-500">Staff</div>
          <div className="text-2xl font-black mt-2">{loading ? '…' : counts.staff}</div>
        </Link>
        <Link href="/admin/orders" className="card p-6 hover:shadow-lg">
          <div className="text-sm text-stone-500">Orders</div>
          <div className="text-2xl font-black mt-2">{loading ? '…' : counts.orders}</div>
        </Link>
      </div>
    </main>
  )
}
