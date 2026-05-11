'use client'
// app/order/page.js
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { FiShoppingCart, FiPlus, FiMinus, FiArrowLeft, FiX } from 'react-icons/fi'
import { MdTableRestaurant } from 'react-icons/md'

const FOOD_BADGE = { VEG: '🟢', NON_VEG: '🔴', VEGAN: '🌿' }

function OrderPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tableId = searchParams.get('table')
  const tableNum = searchParams.get('tableNum')

  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [cart, setCart] = useState({})
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCart, setShowCart] = useState(false)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    if (!tableId) { router.push('/'); return }
    Promise.all([fetch('/api/menu').then(r => r.json()), fetch('/api/categories').then(r => r.json())])
      .then(([items, cats]) => {
        const validItems = Array.isArray(items) ? items.filter(i => i.isAvailable) : []
        const validCats = Array.isArray(cats) ? cats : []
        setMenuItems(validItems)
        setCategories(validCats)
        if (validCats.length > 0) setActiveCategory(validCats[0].id)
        setLoading(false)
      })
      .catch(() => { setMenuItems([]); setCategories([]); setLoading(false) })
  }, [tableId])

  const addToCart = (item) => setCart(prev => ({ ...prev, [item.id]: { ...item, qty: (prev[item.id]?.qty || 0) + 1 } }))
  const removeFromCart = (id) => setCart(prev => {
    const updated = { ...prev }
    if (updated[id].qty <= 1) delete updated[id]
    else updated[id] = { ...updated[id], qty: updated[id].qty - 1 }
    return updated
  })

  const cartItems = Object.values(cart)
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0)

  const filteredItems = activeCategory
    ? menuItems.filter(i => i.categoryId === activeCategory)
    : menuItems

  const placeOrder = async (paymentMethod) => {
    if (cartItems.length === 0) { toast.error('Add items to cart first'); return }
    setPlacing(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          items: cartItems.map(i => ({ menuItemId: i.id, quantity: i.qty })),
          notes,
          paymentMethod
        })
      })
      const order = await res.json()
      if (!res.ok) throw new Error(order.error)

      if (paymentMethod === 'upi') {
        const upiRes = await fetch('/api/upi-config')
        const upiConfig = await upiRes.json()
        const upiLink = `upi://pay?pa=${upiConfig.upiId}&pn=${encodeURIComponent(upiConfig.merchantName)}&am=${cartTotal.toFixed(2)}&cu=INR&tn=Order-${order.id.slice(-6)}`
        window.location.href = upiLink
        setTimeout(() => router.push(`/order/confirm?orderId=${order.id}`), 2000)
      } else {
        router.push(`/order/confirm?orderId=${order.id}`)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-stone-500">Loading menu...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50 pb-28">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/')} className="p-1.5 hover:bg-stone-100 rounded-lg">
              <FiArrowLeft />
            </button>
            <div>
              <div className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
                <MdTableRestaurant className="text-orange-500" />
                Table {tableNum}
              </div>
              <p className="text-xs text-stone-400">Select items to order</p>
            </div>
          </div>
          <button onClick={() => setShowCart(true)} className="relative p-2 bg-orange-500 text-white rounded-xl">
            <FiShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-stone-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="max-w-md mx-auto px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden flex">
            <div className="flex-1 p-4">
              <div className="flex items-start gap-2 mb-1">
                <span className="text-sm mt-0.5">{FOOD_BADGE[item.foodType]}</span>
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm leading-tight">{item.name}</h3>
                  {item.description && <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">{item.description}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="font-bold text-orange-600">₹{item.price}</span>
                {cart[item.id] ? (
                  <div className="flex items-center gap-2 bg-orange-50 rounded-xl px-2 py-1">
                    <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 bg-orange-500 text-white rounded-lg flex items-center justify-center">
                      <FiMinus className="text-xs" />
                    </button>
                    <span className="font-bold text-orange-600 w-4 text-center text-sm">{cart[item.id].qty}</span>
                    <button onClick={() => addToCart(item)} className="w-6 h-6 bg-orange-500 text-white rounded-lg flex items-center justify-center">
                      <FiPlus className="text-xs" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => addToCart(item)} className="flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl">
                    <FiPlus className="text-xs" /> Add
                  </button>
                )}
              </div>
            </div>
            {item.imageUrl && (
              <div className="relative w-24 h-24 m-3 rounded-xl overflow-hidden shrink-0">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && !showCart && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-30 max-w-md mx-auto">
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-orange-500 text-white rounded-2xl py-4 flex items-center justify-between px-5 shadow-xl shadow-orange-200"
          >
            <span className="bg-orange-600 px-2 py-0.5 rounded-lg text-sm font-bold">{cartCount} items</span>
            <span className="font-bold">View Cart</span>
            <span className="font-bold">₹{cartTotal}</span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <h2 className="font-bold text-stone-800 text-lg">Your Order</h2>
              <button onClick={() => setShowCart(false)} className="p-1.5 hover:bg-stone-100 rounded-lg">
                <FiX />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-stone-800">{item.name}</p>
                    <p className="text-xs text-stone-400">₹{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-2 bg-stone-100 rounded-xl px-2 py-1">
                    <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-stone-600 border">
                      <FiMinus className="text-xs" />
                    </button>
                    <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                    <button onClick={() => addToCart(item)} className="w-6 h-6 bg-orange-500 text-white rounded-lg flex items-center justify-center">
                      <FiPlus className="text-xs" />
                    </button>
                  </div>
                  <span className="font-bold text-orange-600 text-sm w-14 text-right">₹{item.price * item.qty}</span>
                </div>
              ))}

              <div className="pt-3 border-t border-stone-100">
                <textarea
                  placeholder="Special instructions (optional)..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="input text-sm resize-none h-16"
                />
              </div>
            </div>

            <div className="p-5 border-t border-stone-100">
              <div className="flex justify-between mb-4">
                <span className="text-stone-600 font-medium">Total</span>
                <span className="font-black text-xl text-stone-800">₹{cartTotal}</span>
              </div>
              <p className="text-xs text-stone-500 text-center mb-3">Choose payment method</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => placeOrder('upi')}
                  disabled={placing}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95 disabled:opacity-60 text-sm"
                >
                  💳 Pay via UPI
                </button>
                <button
                  onClick={() => placeOrder('offline')}
                  disabled={placing}
                  className="bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95 disabled:opacity-60 text-sm"
                >
                  💵 Pay at Counter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrderPageWrapper() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}><OrderPage /></Suspense>
}
