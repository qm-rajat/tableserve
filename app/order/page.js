'use client'
// app/order/page.js — Customer menu, cart, order placement
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { FiShoppingCart, FiPlus, FiMinus, FiArrowLeft, FiX, FiInfo, FiClock, FiSearch } from 'react-icons/fi'
import { MdTableRestaurant } from 'react-icons/md'

const FOOD_BADGE = { VEG: '🟢', NON_VEG: '🔴', VEGAN: '🌿' }

function OrderPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tableId  = searchParams.get('table')
  const tableNum = searchParams.get('tableNum')

  const [menuItems,       setMenuItems]       = useState([])
  const [categories,      setCategories]      = useState([])
  const [activeCategory,  setActiveCategory]  = useState(null)
  const [cart,            setCart]            = useState({})
  const [notes,           setNotes]           = useState('')
  const [loading,         setLoading]         = useState(true)
  const [showCart,        setShowCart]        = useState(false)
  const [placing,         setPlacing]         = useState(false)
  const [searchQuery,     setSearchQuery]     = useState('')
  const [orderHistory,    setOrderHistory]    = useState([])
  const [showHistory,     setShowHistory]     = useState(false)

  useEffect(() => {
    if (!tableId) { router.push('/'); return }
    
    // Load history from localStorage
    const savedHistory = JSON.parse(localStorage.getItem('tb_order_history') || '[]')
    setOrderHistory(savedHistory)

    const fetchData = async () => {
      try {
        const [itemsRes, catsRes] = await Promise.all([
          fetch('/api/menu'),
          fetch('/api/categories')
        ])

        if (!itemsRes.ok || !catsRes.ok) {
          throw new Error('Failed to fetch menu or categories')
        }

        const items = await itemsRes.json()
        const cats = await catsRes.json()

        setMenuItems(Array.isArray(items) ? items.filter(i => i.is_available) : [])
        setCategories(Array.isArray(cats) ? cats : [])
        if (Array.isArray(cats) && cats.length > 0) setActiveCategory(cats[0].id)
      } catch (err) {
        console.error('Fetch error:', err)
        toast.error('Failed to load menu. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tableId])

  const addToCart    = (item) => setCart(prev => ({ ...prev, [item.id]: { ...item, qty: (prev[item.id]?.qty || 0) + 1 } }))
  const removeFromCart = (id) => setCart(prev => {
    const updated = { ...prev }
    if (updated[id].qty <= 1) delete updated[id]
    else updated[id] = { ...updated[id], qty: updated[id].qty - 1 }
    return updated
  })

  const cartItems = Object.values(cart)
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0)
  
  const filteredItems = menuItems.filter(i => {
    const matchesCat = !activeCategory || i.category_id === activeCategory
    const matchesSearch = !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

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
          paymentMethod,
        })
      })
      
      const order = await res.json()
      if (!res.ok) throw new Error(order.error || 'Failed to place order')

      // Save to history
      const newHistory = [{ id: order.id, total: cartTotal, date: new Date().toISOString(), items: cartItems.length }, ...orderHistory].slice(0, 5)
      localStorage.setItem('tb_order_history', JSON.stringify(newHistory))

      if (paymentMethod === 'upi') {
        try {
          const upiRes = await fetch('/api/upi-config')
          if (!upiRes.ok) throw new Error('UPI configuration failed')
          const upiConfig = await upiRes.json()
          const upiLink = `upi://pay?pa=${upiConfig.upi_id}&pn=${encodeURIComponent(upiConfig.merchant_name)}&am=${cartTotal.toFixed(2)}&cu=INR&tn=Order-${order.id.slice(-6)}`
          window.location.href = upiLink
          setTimeout(() => router.push(`/order/confirm?orderId=${order.id}`), 2000)
        } catch (upiErr) {
          console.error('UPI error:', upiErr)
          toast.error('Could not initiate UPI payment. Please pay at the counter.')
          setTimeout(() => router.push(`/order/confirm?orderId=${order.id}`), 3000)
        }
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
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/')} className="p-3 bg-stone-100 hover:bg-stone-200 rounded-2xl text-stone-600 transition-all active:scale-90">
                <FiArrowLeft size={18} />
              </button>
              <div className="flex flex-col items-start px-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 leading-none mb-1.5 ml-1">Table</p>
                <div className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500 rounded-full shadow-lg shadow-orange-500/20">
                  <span className="font-display font-black text-white text-base">#{tableNum}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {orderHistory.length > 0 && (
                <button 
                  onClick={() => setShowHistory(true)} 
                  className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-2xl border border-stone-200 transition-all active:scale-95 group"
                >
                  <FiClock size={16} className="group-hover:text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden xs:inline">Track Orders</span>
                  {orderHistory.length > 0 && (
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  )}
                </button>
              )}
              <button onClick={() => setShowCart(true)} className="relative p-3 bg-stone-900 text-white rounded-2xl shadow-lg shadow-stone-900/10">
                <FiShoppingCart size={18} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* Search Table */}
          <div className="relative mb-4">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border-transparent rounded-2xl pl-11 pr-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-400/20 transition-all"
            />
          </div>

          {/* Visual Category Slider */}
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1 -mx-1 snap-x">
            <button 
              onClick={() => setActiveCategory(null)}
              className="snap-start shrink-0 flex flex-col items-center gap-2 group outline-none"
            >
              <div className={`w-20 h-20 rounded-[2.5rem] overflow-hidden transition-all duration-500 border-4 ${
                !activeCategory 
                  ? 'border-orange-500 scale-105 shadow-xl shadow-orange-500/20' 
                  : 'border-white bg-white grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 shadow-sm'
                }`}
              >
                <div className="w-full h-full bg-stone-900 flex flex-col items-center justify-center text-white">
                  <div className="text-[10px] font-black uppercase tracking-widest leading-none">All</div>
                  <div className="font-display font-black text-2xl">⚡</div>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${!activeCategory ? 'text-stone-800' : 'text-stone-400'}`}>
                Discover
              </span>
            </button>

            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setActiveCategory(cat.id)}
                className="snap-start shrink-0 flex flex-col items-center gap-2 group outline-none"
              >
                <div className={`w-20 h-20 rounded-[2.5rem] overflow-hidden transition-all duration-500 border-4 ${
                  activeCategory === cat.id 
                    ? 'border-orange-500 scale-105 shadow-xl shadow-orange-500/20' 
                    : 'border-white bg-white grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 shadow-sm'
                  }`}
                >
                  {cat.image_url ? (
                    <Image 
                      src={cat.image_url} 
                      alt={cat.name} 
                      fill 
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-orange-50 flex items-center justify-center text-2xl font-black text-orange-500">
                      {cat.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${activeCategory === cat.id ? 'text-stone-800' : 'text-stone-400'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-md mx-auto px-6 py-6">
        <motion.div layout className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map(item => (
              <motion.div 
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2rem] border border-stone-100 p-2 flex gap-4 hover:shadow-md transition-shadow duration-300"
              >
                <div className="relative w-28 h-28 rounded-[1.5rem] overflow-hidden shrink-0 shadow-inner">
                  {item.image_url ? (
                    <Image 
                      src={item.image_url} 
                      alt={item.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center p-4">
                      <div className="w-8 h-8 rounded-full bg-stone-200 animate-pulse mb-2" />
                      <div className="w-12 h-1 bg-stone-200 rounded-full" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                    {FOOD_BADGE[item.food_type]}
                  </div>
                </div>

                <div className="flex-1 py-2 pr-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-black text-stone-800 text-lg leading-tight mb-1">{item.name}</h3>
                    {item.description && <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">{item.description}</p>}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-black text-lg text-stone-800">₹{item.price}</span>
                    
                    {cart[item.id] ? (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 bg-stone-900 rounded-2xl p-1"
                      >
                        <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center text-white hover:text-orange-400 transition-colors"><FiMinus size={14} /></button>
                        <span className="font-black text-white text-sm min-w-[20px] text-center">{cart[item.id].qty}</span>
                        <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center text-white hover:text-orange-400 transition-colors"><FiPlus size={14} /></button>
                      </motion.div>
                    ) : (
                      <button 
                        onClick={() => addToCart(item)} 
                        className="w-10 h-10 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        <FiPlus />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-20 opacity-40">
            <FiSearch size={48} className="mx-auto mb-4" />
            <p className="font-display text-xl">No items found</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartCount > 0 && !showCart && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-0 right-0 px-6 z-40 max-w-md mx-auto"
          >
            <button 
              onClick={() => setShowCart(true)}
              className="w-full bg-stone-900 text-white rounded-[2rem] py-5 flex items-center justify-between px-8 shadow-2xl shadow-stone-900/30 group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <FiShoppingCart className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{cartCount} items selected</p>
                  <p className="font-display font-black text-lg">View My Order</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total</p>
                <p className="font-display font-black text-xl text-orange-500">₹{cartTotal}</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistory(false)} className="absolute inset-0 bg-stone-900/80 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-10 border-b border-stone-100 relative">
                <h2 className="text-3xl font-display font-black text-stone-800">Track Orders</h2>
                <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-2">Active & Recent Orders (Saved on Device)</p>
                <button onClick={() => setShowHistory(false)} className="absolute top-8 right-8 p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-all"><FiX size={18} /></button>
              </div>
              
              <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4 bg-stone-50/50">
                {orderHistory.map(h => (
                  <motion.div 
                    key={h.id} 
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push(`/order/confirm?orderId=${h.id}`)}
                    className="bg-white rounded-[2rem] p-5 flex items-center justify-between border border-stone-100 shadow-sm cursor-pointer group transition-all"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 bg-stone-900 text-white rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                        <FiClock size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-0.5">{new Date(h.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                        <p className="font-black text-stone-800 tracking-tight text-base leading-none">Order #{h.id.slice(-6).toUpperCase()}</p>
                        <p className="text-[10px] text-stone-400 font-bold uppercase mt-1 italic">{h.items} delights</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-orange-600 text-lg italic">₹{h.total}</p>
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-300 group-hover:text-orange-500 underline flex items-center gap-1 justify-end">Track <FiArrowLeft className="rotate-180" /></span>
                    </div>
                  </motion.div>
                ))}
                {orderHistory.length === 0 && (
                   <div className="text-center py-10 opacity-30">
                     <p className="text-sm font-bold uppercase tracking-widest">No history yet</p>
                   </div>
                )}
              </div>
              
              <div className="p-8 bg-white border-t border-stone-100 text-center">
                <p className="text-[10px] text-stone-400 uppercase tracking-widest leading-loose mb-6">
                  History is stored locally on this browser.<br/>
                  Clearing cache will remove these records.
                </p>
                <button 
                  onClick={() => setShowHistory(false)} 
                  className="w-full py-4 bg-stone-50 hover:bg-stone-100 text-stone-800 font-black rounded-2xl text-xs uppercase tracking-widest transition-all"
                >
                  Return to Menu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={() => setShowCart(false)} />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white rounded-t-[3rem] max-h-[90vh] flex flex-col shadow-[0_-20px_40px_rgba(0,0,0,0.1)]"
            >
              <div className="w-12 h-1 bg-stone-200 rounded-full mx-auto mt-4 mb-2" />
              <div className="flex items-center justify-between p-8 border-b border-stone-100">
                <h2 className="text-3xl font-display font-black text-stone-800">Checkout</h2>
                <button onClick={() => setShowCart(false)} className="p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-colors"><FiX /></button>
              </div>

              <div className="overflow-y-auto flex-1 p-8 space-y-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">Selected Delights</p>
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      {item.image_url && (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-stone-800 leading-tight">{item.name}</p>
                        <p className="text-xs text-stone-400">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-3 bg-stone-50 rounded-xl p-1">
                        <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-orange-500"><FiMinus size={12} /></button>
                        <span className="font-black text-stone-800 text-xs w-4 text-center">{item.qty}</span>
                        <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-orange-500"><FiPlus size={12} /></button>
                      </div>
                      <span className="font-black text-stone-800 w-16 text-right">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-stone-100">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 block mb-3">Kitchen Notes</label>
                  <textarea 
                    placeholder="Add a special request..." 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)}
                    className="input h-24 resize-none" 
                  />
                  <div className="flex items-start gap-2 mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <FiInfo className="text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-800 leading-relaxed">Please inform us if you have any allergies. Our team will do their best to accommodate your needs.</p>
                  </div>
                </div>
              </div>

              <div className="p-8 pb-10 bg-white border-t border-stone-100">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Amount Due</p>
                    <p className="text-4xl font-display font-black text-stone-800">₹{cartTotal}</p>
                  </div>
                  <p className="text-xs text-stone-400">Incl. GST & Service</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={() => placeOrder('upi')} disabled={placing}
                    className="bg-stone-900 hover:bg-stone-800 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-stone-900/10 flex flex-col items-center justify-center transition-all active:scale-[0.98] disabled:opacity-60">
                    <span className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Fast Checkout</span>
                    <span className="text-lg">💳 Pay via UPI</span>
                  </button>
                  <button onClick={() => placeOrder('offline')} disabled={placing}
                    className="bg-white hover:bg-stone-50 text-stone-900 border-2 border-stone-900 font-black py-4 px-6 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-[0.98] disabled:opacity-60">
                    <span className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Pay Later</span>
                    <span className="text-lg">💵 Cash / Counter</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function OrderPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <OrderPage />
    </Suspense>
  )
}
