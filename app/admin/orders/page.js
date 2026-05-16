'use client'
// app/admin/orders/page.js
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiSearch, FiFilter } from 'react-icons/fi'

const STATUS_LABELS = {
  PENDING_OFFLINE: 'Pending Offline',
  UPI_PENDING: 'UPI Pending',
  PAID_UPI: 'Paid UPI',
  PAID_OFFLINE: 'Paid Offline',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [deliveredFilter, setDeliveredFilter] = useState('')
  const [search, setSearch] = useState('')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (deliveredFilter !== '') params.set('delivered', deliveredFilter)
      params.set('limit', '100')
      const res = await fetch(`/api/orders?${params.toString()}`)
      if (!res.ok) throw new Error('Unable to fetch orders')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [statusFilter, deliveredFilter])

  const filtered = orders.filter(order => {
    const query = search.trim().toLowerCase()
    if (!query) return true
    const tableNumber = order.table?.number?.toString() || ''
    const payment = STATUS_LABELS[order.payment_status]?.toLowerCase() || ''
    const notes = order.notes || ''
    return tableNumber.includes(query) || payment.includes(query) || notes.toLowerCase().includes(query)
  })

  return (
    <main className="p-8 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-stone-800">Orders</h1>
          <p className="text-stone-500 text-sm">View and filter orders across all tables.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by table, notes, status"
              className="input pl-10"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input">
            <option value="">All Statuses</option>
            <option value="PENDING_OFFLINE">Pending Offline</option>
            <option value="UPI_PENDING">UPI Pending</option>
            <option value="PAID_UPI">Paid UPI</option>
            <option value="PAID_OFFLINE">Paid Offline</option>
          </select>
          <select value={deliveredFilter} onChange={e => setDeliveredFilter(e.target.value)} className="input">
            <option value="">All Delivery</option>
            <option value="true">Delivered</option>
            <option value="false">Not Delivered</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-stone-500">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-stone-500">No orders match your filters.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const totalAmount = Number(order.total_amount) || 0
            return (
              <article key={order.id} className="card p-6 hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <div className="text-base text-stone-500">Order ID</div>
                    <div className="font-semibold text-stone-900">{order.id}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <div className="text-sm text-stone-500">Table</div>
                      <div className="font-semibold text-stone-900">{order.table?.number ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-stone-500">Total</div>
                      <div className="font-semibold text-stone-900">₹{totalAmount.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-stone-500">Payment</div>
                      <div className="font-semibold text-stone-900">{STATUS_LABELS[order.payment_status] || order.payment_status}</div>
                    </div>
                    <div>
                      <div className="text-sm text-stone-500">Delivered</div>
                      <div className={`font-semibold ${order.is_delivered ? 'text-green-600' : 'text-orange-500'}`}>{order.is_delivered ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <div className="text-sm text-stone-500 mb-2">Items</div>
                    <div className="space-y-2">
                      {order.order_items?.map(item => {
                        const unitPrice = Number(item.unit_price) || 0
                        return (
                          <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-stone-100 bg-stone-50 p-3">
                            <div>
                              <div className="font-semibold text-stone-900">{item.menu_item?.name || 'Item'}</div>
                              <div className="text-xs text-stone-500">{item.quantity} × ₹{unitPrice.toFixed(2)}</div>
                            </div>
                            <div className="text-sm font-semibold text-stone-700">₹{(item.quantity * unitPrice).toFixed(2)}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-stone-500">Notes</div>
                      <div className="mt-2 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600 min-h-[80px]">{order.notes || 'No notes provided'}</div>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm text-stone-500">
                      <div>
                        <p className="font-semibold text-stone-900">Created</p>
                        <p>{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2 text-stone-500">
                        <FiFilter />
                        <span>Order details</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
