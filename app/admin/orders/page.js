'use client'
// app/admin/orders/page.js
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import PaymentBadge from '@/components/staff/PaymentBadge'
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi'

export default function AdminOrders() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filter,   setFilter]   = useState({ paymentStatus: '', delivered: '' })
  const [updating, setUpdating] = useState({})

  const fetchOrders = async () => {
    const params = new URLSearchParams({ limit: '200' })
    if (filter.paymentStatus)    params.set('status',    filter.paymentStatus)
    if (filter.delivered !== '')  params.set('delivered', filter.delivered)
    const res  = await fetch(`/api/orders?${params}`)
    const data = await res.json()
    setOrders(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [filter])

  const updateOrder = async (id, patch) => {
    setUpdating(prev => ({ ...prev, [id]: true }))
    try {
      const res     = await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
      const updated = await res.json()
      setOrders(prev => prev.map(o => o.id === id ? updated : o))
      toast.success('Order updated')
    } catch { toast.error('Update failed') }
    finally { setUpdating(prev => ({ ...prev, [id]: false })) }
  }

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-stone-800">Order Log</h1>
          <p className="text-stone-500 text-sm">{orders.length} orders</p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary text-sm py-2 px-4">Refresh</button>
      </div>

      <div className="card mb-5 flex flex-wrap gap-3 items-center">
        <FiFilter className="text-stone-400" />
        <select className="input w-auto text-sm" value={filter.paymentStatus} onChange={e => setFilter(f => ({ ...f, paymentStatus: e.target.value }))}>
          <option value="">All Payments</option>
          <option value="PENDING_OFFLINE">Pending Offline</option>
          <option value="UPI_PENDING">UPI Pending</option>
          <option value="PAID_UPI">Paid via UPI</option>
          <option value="PAID_OFFLINE">Paid Offline</option>
        </select>
        <select className="input w-auto text-sm" value={filter.delivered} onChange={e => setFilter(f => ({ ...f, delivered: e.target.value }))}>
          <option value="">All Delivery</option>
          <option value="true">Delivered</option>
          <option value="false">Not Delivered</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-stone-100 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {orders.length === 0 && <div className="text-center py-16 text-stone-400"><p className="font-semibold">No orders found</p></div>}
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <div className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-stone-50"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div className="font-black text-stone-700 text-xl w-10 shrink-0">T{order.table?.number}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">
                    {order.order_items?.map(i => `${i.menu_item?.name} ×${i.quantity}`).join(', ')}
                  </p>
                  <p className="text-xs text-stone-400">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <PaymentBadge status={order.payment_status} />
                  {order.is_delivered
                    ? <span className="text-xs text-green-600 font-semibold hidden sm:block">✓ Delivered</span>
                    : <span className="text-xs text-stone-400 hidden sm:block">Pending</span>}
                  <span className="font-black text-orange-600 text-sm w-16 text-right">₹{order.total_amount}</span>
                  {expanded === order.id ? <FiChevronUp className="text-stone-400" /> : <FiChevronDown className="text-stone-400" />}
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t border-stone-100 px-4 py-4 bg-stone-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-stone-500 mb-2">ORDER ITEMS</p>
                      {order.order_items?.map(item => (
                        <div key={item.id} className="flex justify-between text-sm py-0.5">
                          <span className="text-stone-600">{item.menu_item?.name} ×{item.quantity}</span>
                          <span className="font-semibold">₹{item.unit_price * item.quantity}</span>
                        </div>
                      ))}
                      {order.notes && <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mt-2">📝 {order.notes}</p>}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-500 mb-2">ADMIN CONTROLS</p>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-stone-500 block mb-1">Payment Status</label>
                          <select className="input text-sm" value={order.payment_status} disabled={updating[order.id]}
                            onChange={e => updateOrder(order.id, { paymentStatus: e.target.value })}>
                            <option value="PENDING_OFFLINE">Pending Offline</option>
                            <option value="UPI_PENDING">UPI Pending</option>
                            <option value="PAID_UPI">Paid via UPI</option>
                            <option value="PAID_OFFLINE">Paid Offline</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-stone-500 block mb-1">Delivery Status</label>
                          <select className="input text-sm" value={order.is_delivered ? 'true' : 'false'} disabled={updating[order.id]}
                            onChange={e => updateOrder(order.id, { isDelivered: e.target.value === 'true' })}>
                            <option value="false">Not Delivered</option>
                            <option value="true">Delivered</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 mt-3">Order ID: {order.id}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
