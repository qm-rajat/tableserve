'use client'
// app/staff/page.js — Live orders dashboard
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiRefreshCw, FiTruck } from 'react-icons/fi'
import { MdTableRestaurant } from 'react-icons/md'
import PaymentBadge from '@/components/staff/PaymentBadge'

export default function StaffDashboard() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState({})

  const fetchOrders = async () => {
    const res  = await fetch('/api/orders?delivered=false&limit=50')
    const data = await res.json()
    setOrders(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 15000)
    return () => clearInterval(interval)
  }, [])

  const updateOrder = async (id, patch) => {
    setUpdating(prev => ({ ...prev, [id]: true }))
    try {
      const res     = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const updated = await res.json()
      setOrders(prev =>
        prev.map(o => o.id === id ? updated : o)
            .filter(o => !o.is_delivered)
      )
      toast.success('Order updated')
    } catch {
      toast.error('Update failed')
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }))
    }
  }

  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000)
    if (mins < 1)  return 'just now'
    if (mins < 60) return `${mins}m ago`
    return `${Math.floor(mins / 60)}h ago`
  }

  const activeOrders = orders.filter(o => !o.is_delivered)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-stone-800">Live Orders</h1>
          <p className="text-stone-500 text-sm">{activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''} · auto-refreshes every 15s</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 btn-secondary text-sm py-2">
          <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-56 bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      )}

      {!loading && activeOrders.length === 0 && (
        <div className="text-center py-20 text-stone-400">
          <MdTableRestaurant className="text-6xl mx-auto mb-3 text-stone-200" />
          <p className="font-semibold text-lg">No active orders</p>
          <p className="text-sm">New orders will appear here automatically</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeOrders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-stone-800 text-white">
              <div className="flex items-center gap-2">
                <MdTableRestaurant className="text-orange-400" />
                <span className="font-bold text-lg">Table {order.table?.number}</span>
                {order.table?.location_label && <span className="text-xs text-stone-400">{order.table.location_label}</span>}
              </div>
              <span className="text-xs text-stone-400">{timeAgo(order.created_at)}</span>
            </div>

            <div className="px-4 py-3 border-b border-stone-100">
              {order.order_items?.map(item => (
                <div key={item.id} className="flex justify-between text-sm py-0.5">
                  <span className="text-stone-700">{item.menu_item?.name}</span>
                  <span className="font-semibold text-stone-500">×{item.quantity}</span>
                </div>
              ))}
              {order.notes && <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mt-2">📝 {order.notes}</p>}
            </div>

            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <PaymentBadge status={order.payment_status} />
                <span className="font-black text-orange-600">₹{order.total_amount}</span>
              </div>

              {order.payment_status === 'UPI_PENDING' && (
                <button onClick={() => updateOrder(order.id, { paymentStatus: 'PAID_UPI' })} disabled={updating[order.id]}
                  className="w-full text-xs btn-success py-2">✓ Confirm UPI Payment</button>
              )}
              {order.payment_status === 'PENDING_OFFLINE' && (
                <button onClick={() => updateOrder(order.id, { paymentStatus: 'PAID_OFFLINE' })} disabled={updating[order.id]}
                  className="w-full text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition-all">
                  💵 Mark as Paid Offline
                </button>
              )}
              <button onClick={() => updateOrder(order.id, { isDelivered: true })} disabled={updating[order.id]}
                className="w-full text-xs flex items-center justify-center gap-1.5 border-2 border-stone-200 hover:border-green-400 hover:text-green-600 text-stone-500 font-semibold py-2 px-4 rounded-xl transition-all">
                <FiTruck /> Mark as Delivered
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
