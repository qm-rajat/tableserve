'use client'
// app/order/confirm/page.js
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheck, FiClock, FiPackage, FiArrowLeft, FiMoreHorizontal, FiExternalLink } from 'react-icons/fi'
import { MdTableRestaurant } from 'react-icons/md'

const STATUS_LABELS = {
  PENDING_OFFLINE: { label: 'Payment Pending',          color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100'  },
  UPI_PENDING:     { label: 'UPI Verifying...',         color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  PAID_UPI:        { label: 'Payment Confirmed',        color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100'  },
  PAID_OFFLINE:    { label: 'Payment Confirmed',        color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100'   },
}

function ConfirmPage() {
  const searchParams = useSearchParams()
  const router  = useRouter()
  const orderId = searchParams.get('orderId')
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = async () => {
    if (!orderId) return
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (!res.ok) throw new Error('Order not found')
      const data = await res.json()
      setOrder(data)
    } catch (err) {
      console.error('Fetch order error:', err)
      // Only set loading false if we don't have order data yet
      if (!order) setOrder({ error: true })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
    const interval = setInterval(fetchOrder, 10000)
    return () => clearInterval(interval)
  }, [orderId])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!order || order.error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-8 text-center">
      <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
        <FiPackage className="text-3xl text-stone-300" />
      </div>
      <h1 className="text-3xl font-display font-black text-stone-800 mb-2">Order Not Found</h1>
      <p className="text-stone-500 text-sm mb-10">We couldn't locate this order. Please check the ID or contact staff.</p>
      <button onClick={() => router.push('/')} className="btn-primary w-full max-w-xs">Return Home</button>
    </div>
  )

  const payStatus = STATUS_LABELS[order.payment_status]
  const isPaid    = order.payment_status === 'PAID_UPI' || order.payment_status === 'PAID_OFFLINE'
  const steps = [
    { label: 'Order Received', done: true,              icon: <FiCheck size={14} /> },
    { label: 'Payment Step',   done: isPaid,            icon: <FiClock size={14} />, detail: payStatus?.label },
    { label: 'Preparing',      done: isPaid,            icon: <FiMoreHorizontal size={14} /> },
    { label: 'Ready / Served', done: order.is_delivered, icon: <FiPackage size={14} /> },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemAnim = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-[100dvh] bg-stone-50 pb-20">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[80%] h-[40%] bg-orange-400 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[60%] h-[30%] bg-amber-400 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="max-w-md mx-auto px-6 pt-12 relative z-10">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Header Card */}
          <motion.div variants={itemAnim} className="text-center mb-10">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-2xl shadow-green-500/10 flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-green-500/10 rounded-[2.5rem] animate-ping" />
              <div className="w-16 h-16 bg-green-500 rounded-[1.8rem] flex items-center justify-center text-white text-3xl shadow-lg shadow-green-500/20">
                <FiCheck strokeWidth={3} />
              </div>
            </div>
            <h1 className="text-4xl font-display font-black text-stone-800 mb-2">Order Confirmed</h1>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Order Reference: #{order.id.slice(-8).toUpperCase()}</p>
          </motion.div>

          {/* Quick Info Card */}
          <motion.div variants={itemAnim} className="card p-4 flex items-center gap-4 bg-white/80 backdrop-blur-md">
            <div className="w-14 h-14 bg-stone-900 rounded-2xl flex flex-col items-center justify-center text-white shrink-0">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">Table</span>
               <span className="text-xl font-display font-black leading-none">{order.table?.number}</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-stone-800">{order.table?.location_label || 'Self Service'}</p>
              <p className="text-xs text-stone-400">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${payStatus?.bg} ${payStatus?.color} ${payStatus?.border}`}>
              {payStatus?.label}
            </div>
          </motion.div>

          {/* Progress Card */}
          <motion.div variants={itemAnim} className="card p-8 bg-white/80 backdrop-blur-md">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-8 border-b border-stone-50 pb-4">Live Status Tracking</h2>
            <div className="space-y-8 relative">
              {/* Connecting Line */}
              <div className="absolute left-[15px] top-[14px] bottom-[14px] w-0.5 bg-stone-100" />
              
              {steps.map((step, i) => (
                <div key={i} className="flex gap-5 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                    step.done ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20' : 'bg-white border-stone-100 text-stone-300'
                  }`}>
                    {step.done ? <FiCheck size={14} strokeWidth={3} /> : step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-black tracking-tight transition-colors duration-500 ${step.done ? 'text-stone-800' : 'text-stone-300'}`}>
                        {step.label}
                      </p>
                      {step.done && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[10px] font-black uppercase tracking-widest text-green-500">Done</motion.span>
                      )}
                    </div>
                    {step.detail && step.done && <p className="text-[10px] text-green-600/60 font-medium mt-0.5">{step.detail}</p>}
                    {!step.done && steps[i-1]?.done && i > 0 && (
                       <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mt-1 animate-pulse flex items-center gap-2">
                         <FiClock /> In Progress...
                       </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Details Card */}
          <motion.div variants={itemAnim} className="card p-8 bg-white shadow-xl shadow-stone-900/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Order Elements</h2>
              <span className="text-xs font-bold text-stone-400">{order.order_items?.length} items</span>
            </div>
            <div className="space-y-4">
              {order.order_items?.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-stone-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-stone-500">
                      {item.quantity}
                    </span>
                    <span className="text-stone-700 font-medium">{item.menu_item?.name}</span>
                  </div>
                  <span className="font-black text-stone-800 italic">₹{item.unit_price * item.quantity}</span>
                </div>
              ))}
              <div className="pt-6 border-t border-stone-100 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Grand Total</p>
                  <p className="text-3xl font-display font-black text-stone-800">₹{order.total_amount}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Payment</p>
                  <p className="text-xs font-bold text-stone-500">{order.payment_status.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemAnim} className="flex flex-col gap-3 py-4">
            <button 
              onClick={() => router.push('/')} 
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-stone-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
              Order Something Else <FiExternalLink className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            <p className="text-[10px] text-stone-400 text-center uppercase tracking-widest leading-loose">
              Keep this page open to track your order in real-time.<br/>
              Automatic updates every 10 seconds.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function ConfirmPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ConfirmPage />
    </Suspense>
  )
}
