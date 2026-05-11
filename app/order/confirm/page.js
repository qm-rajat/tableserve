'use client'
// app/order/confirm/page.js
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FiCheck, FiClock, FiPackage } from 'react-icons/fi'
import { MdTableRestaurant } from 'react-icons/md'

const STATUS_LABELS = {
  PENDING_OFFLINE: { label: 'Payment Pending', color: 'text-amber-600', bg: 'bg-amber-50' },
  UPI_PENDING:     { label: 'UPI Verification Pending', color: 'text-purple-600', bg: 'bg-purple-50' },
  PAID_UPI:        { label: 'Paid via UPI ✓', color: 'text-green-600', bg: 'bg-green-50' },
  PAID_OFFLINE:    { label: 'Paid at Counter ✓', color: 'text-blue-600', bg: 'bg-blue-50' },
}

function ConfirmPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = () => {
    if (!orderId) return
    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then(data => { setOrder(data); setLoading(false) })
  }

  useEffect(() => {
    fetchOrder()
    const interval = setInterval(fetchOrder, 10000)
    return () => clearInterval(interval)
  }, [orderId])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-stone-500">Order not found</p>
    </div>
  )

  const payStatus = STATUS_LABELS[order.paymentStatus]
  const steps = [
    { label: 'Order Placed', done: true, icon: <FiCheck /> },
    { label: 'Being Prepared', done: order.paymentStatus === 'PAID_UPI' || order.paymentStatus === 'PAID_OFFLINE', icon: <FiClock /> },
    { label: 'Delivered', done: order.isDelivered, icon: <FiPackage /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-green-600 text-4xl" />
          </div>
          <h1 className="text-2xl font-black text-stone-800 mb-1">Order Placed!</h1>
          <p className="text-stone-500 text-sm">Order #{order.id.slice(-8).toUpperCase()}</p>
        </div>

        {/* Table Info */}
        <div className="card mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <MdTableRestaurant className="text-orange-600 text-xl" />
          </div>
          <div>
            <p className="font-bold text-stone-800">Table {order.table.number}</p>
            <p className="text-xs text-stone-400">{order.table.locationLabel}</p>
          </div>
          <div className="ml-auto">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${payStatus.bg} ${payStatus.color}`}>
              {payStatus.label}
            </span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="card mb-4">
          <h2 className="font-bold text-stone-800 mb-4 text-sm">Order Status</h2>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.done ? 'bg-green-500 text-white' : 'bg-stone-100 text-stone-400'
                }`}>
                  {step.icon}
                </div>
                <span className={`font-medium text-sm ${step.done ? 'text-stone-800' : 'text-stone-400'}`}>
                  {step.label}
                </span>
                {i === 1 && !step.done && (
                  <span className="ml-auto text-xs text-stone-400 animate-pulse">Waiting...</span>
                )}
                {step.done && <FiCheck className="ml-auto text-green-500" />}
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-4 text-center">Status updates every 10 seconds</p>
        </div>

        {/* Order Items */}
        <div className="card mb-4">
          <h2 className="font-bold text-stone-800 mb-3 text-sm">Your Items</h2>
          <div className="space-y-2">
            {order.orderItems.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-stone-600">{item.menuItem.name} × {item.quantity}</span>
                <span className="font-semibold text-stone-800">₹{item.unitPrice * item.quantity}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2 border-t border-stone-100">
              <span>Total</span>
              <span className="text-orange-600">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {order.paymentStatus === 'UPI_PENDING' && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-4 text-sm text-purple-700 text-center">
            <p className="font-semibold mb-1">UPI Payment Pending</p>
            <p className="text-xs">If your payment was successful, our staff will verify and confirm it shortly.</p>
          </div>
        )}

        <button onClick={() => router.push('/')} className="w-full btn-secondary text-center">
          Order More / New Table
        </button>
      </div>
    </div>
  )
}

export default function ConfirmPageWrapper() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}><ConfirmPage /></Suspense>
}
