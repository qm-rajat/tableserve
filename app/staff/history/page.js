'use client'
// app/staff/history/page.js
import { useEffect, useState } from 'react'
import PaymentBadge from '@/components/staff/PaymentBadge'
import { FiFilter } from 'react-icons/fi'

export default function StaffHistory() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState({ paymentStatus: '', delivered: '' })

  const fetchOrders = async () => {
    const params = new URLSearchParams({ limit: '100' })
    if (filter.paymentStatus)          params.set('status',    filter.paymentStatus)
    if (filter.delivered !== '')        params.set('delivered', filter.delivered)
    const res  = await fetch(`/api/orders?${params}`)
    const data = await res.json()
    setOrders(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [filter])

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-stone-800">Order History</h1>
          <p className="text-stone-500 text-sm">{orders.length} orders</p>
        </div>
      </div>

      <div className="card mb-5 flex flex-wrap gap-3 items-center">
        <FiFilter className="text-stone-400" />
        <select className="input w-auto text-sm" value={filter.paymentStatus}
          onChange={e => setFilter(f => ({ ...f, paymentStatus: e.target.value }))}>
          <option value="">All Payments</option>
          <option value="PENDING_OFFLINE">Pending Offline</option>
          <option value="UPI_PENDING">UPI Pending</option>
          <option value="PAID_UPI">Paid via UPI</option>
          <option value="PAID_OFFLINE">Paid Offline</option>
        </select>
        <select className="input w-auto text-sm" value={filter.delivered}
          onChange={e => setFilter(f => ({ ...f, delivered: e.target.value }))}>
          <option value="">All Delivery</option>
          <option value="true">Delivered</option>
          <option value="false">Not Delivered</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-stone-100 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-stone-100 px-4 py-3 flex items-center gap-4">
              <div className="font-bold text-2xl text-stone-700 w-8">T{order.table?.number}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-700 truncate">
                  {order.order_items?.map(i => `${i.menu_item?.name} ×${i.quantity}`).join(', ')}
                </p>
                <p className="text-xs text-stone-400">{formatDate(order.created_at)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <PaymentBadge status={order.payment_status} />
                {order.is_delivered
                  ? <span className="text-xs text-green-600 font-semibold">✓ Delivered</span>
                  : <span className="text-xs text-stone-400">Not delivered</span>}
              </div>
              <div className="font-black text-orange-600 text-sm w-16 text-right">₹{order.total_amount}</div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-center text-stone-400 py-12">No orders found</p>}
        </div>
      )}
    </div>
  )
}
