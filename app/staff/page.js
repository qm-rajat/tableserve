'use client'
// app/staff/page.js — Live orders dashboard
import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { FiRefreshCw, FiTruck, FiClock, FiAlertCircle, FiCheck, FiDollarSign } from 'react-icons/fi'
import { MdTableRestaurant } from 'react-icons/md'
import PaymentBadge from '@/components/staff/PaymentBadge'

export default function StaffDashboard() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState({})
  const [filter,   setFilter]   = useState('all') // 'all', 'pending_payment', 'ready'

  const fetchOrders = useCallback(async () => {
    try {
      const res  = await fetch('/api/orders?delivered=false&limit=50')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const updateOrder = async (id, patch) => {
    setUpdating(prev => ({ ...prev, [id]: true }))
    try {
      const res     = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const updated = await res.json()
      if (!res.ok) throw new Error(updated.error)
      
      setOrders(prev =>
        prev.map(o => o.id === id ? updated : o)
            .filter(o => !o.is_delivered)
      )
      toast.success('Kitchen synced successfully')
    } catch (err) {
      toast.error(err.message || 'Update failed')
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }))
    }
  }

  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000)
    if (mins < 1)  return 'Just now'
    if (mins < 60) return `${mins}m ago`
    return `${Math.floor(mins / 60)}h ago`
  }

  const activeOrders = orders.filter(o => {
    if (filter === 'pending_payment') return o.payment_status.includes('PENDING')
    if (filter === 'ready') return !o.payment_status.includes('PENDING')
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display font-black text-stone-800">Live Kitchen Queue</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-[10px] font-black uppercase tracking-widest text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {orders.length} Active Orders
            </div>
            <p className="text-stone-400 text-xs">Auto-refresh every 10s</p>
          </div>
        </div>
        
        <div className="flex bg-stone-100 p-1.5 rounded-2xl gap-1">
          {['all', 'pending_payment', 'ready'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
          <button onClick={fetchOrders} className="ml-4 p-2.5 text-stone-400 hover:text-orange-500 transition-colors">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={18} />
          </button>
        </div>
      </header>

      {loading && orders.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-stone-50 rounded-[2.5rem] animate-pulse" />)}
        </div>
      ) : activeOrders.length === 0 ? (
        <div className="text-center py-40 border-2 border-dashed border-stone-100 rounded-[3rem]">
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <MdTableRestaurant className="text-4xl text-stone-200" />
          </div>
          <h2 className="text-2xl font-display font-black text-stone-400">Zen Kitchen</h2>
          <p className="text-stone-300 text-sm max-w-xs mx-auto mt-2">No pending orders matching your filters at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {activeOrders.map(order => (
              <motion.div 
                layout
                key={order.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`card flex flex-col group transition-all duration-500 overflow-hidden ${
                  order.payment_status.includes('PENDING') ? 'ring-2 ring-amber-400/20 shadow-amber-900/5' : 'shadow-stone-900/5'
                }`}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-2xl font-display font-black text-xl border-2 ${
                      order.payment_status.includes('PENDING') ? 'bg-amber-500 text-white border-amber-400' : 'bg-stone-900 text-white border-stone-800'
                    }`}>
                      {order.table?.number}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Order #{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm font-bold text-stone-800">{order.table?.location_label || 'Main Area'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5 justify-end">
                      <FiClock className="text-orange-500" /> {timeAgo(order.created_at)}
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="flex-1 space-y-3 mb-8">
                  {order.order_items?.map(item => (
                    <div key={item.id} className="flex justify-between items-center group/item p-3 bg-stone-50 rounded-2xl hover:bg-stone-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-xs font-black text-stone-800 shadow-sm">
                          {item.quantity}
                        </span>
                        <span className="text-sm font-bold text-stone-700">{item.menu_item?.name}</span>
                      </div>
                    <span className="text-xs text-stone-400">
                      ₹{((item.menu_item?.price || item.unit_price || 0) * item.quantity).toFixed(2)}
                    </span>
                    </div>
                  ))}
                  {order.notes && (
                    <div className="flex items-start gap-3 p-4 bg-orange-50/50 rounded-2xl border border-orange-100 text-orange-800">
                      <FiAlertCircle className="mt-1 shrink-0" />
                      <p className="text-xs font-medium leading-relaxed italic">{order.notes}</p>
                    </div>
                  )}
                </div>

                {/* Footer / Actions */}
                <div className="mt-auto pt-6 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Payment Due</p>
                      <p className="text-xl font-display font-black text-stone-800">₹{order.total_amount}</p>
                    </div>
                    <PaymentBadge status={order.payment_status} />
                  </div>

                  <div className="space-y-3">
                    {order.payment_status === 'UPI_PENDING' && (
                      <button 
                        onClick={() => updateOrder(order.id, { paymentStatus: 'PAID_UPI' })} 
                        disabled={updating[order.id]}
                        className="w-full h-14 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        <FiCheck strokeWidth={3} />
                        <span className="uppercase tracking-widest text-xs">Verify UPI Payment</span>
                      </button>
                    )}
                    {order.payment_status === 'PENDING_OFFLINE' && (
                      <button 
                        onClick={() => updateOrder(order.id, { paymentStatus: 'PAID_OFFLINE' })} 
                        disabled={updating[order.id]}
                        className="w-full h-14 bg-stone-900 hover:bg-stone-800 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        <FiDollarSign strokeWidth={3} />
                        <span className="uppercase tracking-widest text-xs">Confirm Cash Payment</span>
                      </button>
                    )}
                    <button 
                      onClick={() => updateOrder(order.id, { isDelivered: true })} 
                      disabled={updating[order.id]}
                      className="w-full h-14 border-2 border-stone-200 hover:border-orange-500 hover:text-orange-600 text-stone-400 font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <FiTruck strokeWidth={3} />
                      <span className="uppercase tracking-widest text-xs">Mark as Delivered</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
