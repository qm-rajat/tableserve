'use client'
// app/staff/history/page.js
import { useEffect, useState } from 'react'
import PaymentBadge from '@/components/staff/PaymentBadge'
import { FiFilter, FiSearch, FiCalendar, FiBox, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

export default function StaffHistory() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState({ paymentStatus: '', delivered: '' })
  const [search,  setSearch]  = useState('')

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

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.table?.number?.toString().includes(search) ||
    o.order_items?.some(i => i.menu_item?.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display font-black text-stone-800">Order Archive</h1>
          <p className="text-stone-500 text-sm mt-1">{orders.length} historical records captured</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-6">Search & Filter</h2>
            
            <div className="space-y-6">
              <div>
                <label className="label">Keyword</label>
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                  <input 
                    type="text" 
                    placeholder="Order #, Table, Item..." 
                    className="input pl-11 text-xs" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label">Payment Status</label>
                <select className="input text-xs" value={filter.paymentStatus}
                  onChange={e => setFilter(f => ({ ...f, paymentStatus: e.target.value }))}>
                  <option value="">All Payments</option>
                  <option value="PENDING_OFFLINE">Pending Offline</option>
                  <option value="UPI_PENDING">UPI Pending</option>
                  <option value="PAID_UPI">Paid via UPI</option>
                  <option value="PAID_OFFLINE">Paid Offline</option>
                </select>
              </div>

              <div>
                <label className="label">Delivery Status</label>
                <select className="input text-xs" value={filter.delivered}
                  onChange={e => setFilter(f => ({ ...f, delivered: e.target.value }))}>
                  <option value="">All Delivery</option>
                  <option value="true">Delivered</option>
                  <option value="false">In Queue</option>
                </select>
              </div>

              <button 
                onClick={() => { setFilter({ paymentStatus: '', delivered: '' }); setSearch('') }}
                className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-orange-500 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>

          <div className="bg-orange-500 rounded-[2rem] p-8 text-white">
             <FiCalendar size={32} className="mb-4 opacity-50" />
             <h3 className="font-display font-black text-xl mb-1">Weekly Insight</h3>
             <p className="text-xs text-orange-200 leading-relaxed font-medium">Use the filters to find specific orders and verify payments for reconciliation.</p>
          </div>
        </aside>

        {/* Orders List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-stone-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Order & ID</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Items Detail</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      [...Array(6)].map((_, i) => (
                        <tr key={i}>
                          <td colSpan={4} className="px-8 py-6"><div className="h-4 bg-stone-50 rounded-full animate-pulse w-full" /></td>
                        </tr>
                      ))
                    ) : filteredOrders.map(order => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={order.id} 
                        className="hover:bg-stone-50/50 transition-colors group"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center font-display font-black text-stone-800">
                              T{order.table?.number}
                            </div>
                            <div>
                              <p className="text-sm font-black text-stone-800">#{order.id.slice(-6).toUpperCase()}</p>
                              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{formatDate(order.created_at)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="max-w-[200px]">
                            <p className="text-xs font-bold text-stone-700 truncate">
                              {order.order_items?.map(i => `${i.menu_item?.name} x${i.quantity}`).join(', ')}
                            </p>
                            <p className="text-[10px] text-stone-400 mt-0.5">{order.order_items?.length} positions</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1.5">
                            <PaymentBadge status={order.payment_status} />
                            <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${order.is_delivered ? 'text-green-500' : 'text-amber-500'}`}>
                              {order.is_delivered ? <><FiCheckCircle /> Served</> : <><FiBox /> In Preparation</>}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <p className="font-display font-black text-lg text-stone-800 group-hover:text-orange-500 transition-colors">₹{order.total_amount}</p>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {!loading && filteredOrders.length === 0 && (
                <div className="p-20 text-center">
                  <FiBox size={40} className="mx-auto mb-4 text-stone-200" />
                  <p className="text-stone-400 text-sm font-medium">No order found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
