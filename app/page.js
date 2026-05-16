'use client'
// app/page.js — Customer table selection
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUsers, FiMapPin, FiChevronRight, FiCoffee } from 'react-icons/fi'
import { MdTableRestaurant } from 'react-icons/md'

export default function HomePage() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/tables')
      .then(r => r.json())
      .then(data => { 
        setTables(data)
        setLoading(false) 
      })
  }, [])

  const handleTableSelect = (table) => {
    if (!table.is_active || getTableStatus(table) === 'occupied') return
    router.push(`/order?table=${table.id}&tableNum=${table.number}`)
  }

  const getTableStatus = (table) => {
    if (!table.is_active) return 'inactive'
    const activeOrders = table.orders?.filter(o => !o.is_delivered) || []
    if (activeOrders.length > 0) return 'occupied'
    return 'available'
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] bg-stone-900 flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500 blur-[100px] rounded-full" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="bg-orange-500 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20">
            <FiCoffee className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-3 tracking-tight">TableServe</h1>
          <p className="text-stone-400 text-lg max-w-xs mx-auto">Skip the queue. Select your table and order from your phone.</p>
        </motion.div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white rounded-t-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-display font-black text-stone-800">Choose a Table</h2>
              <p className="text-stone-500 text-sm">Tap an available table to view our menu</p>
            </div>
            <div className="flex gap-2 text-[10px] font-bold uppercase tracking-widest flex-col items-end">
              <span className="flex items-center gap-1.5 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span>Available</span>
              <span className="flex items-center gap-1.5 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Occupied</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 gap-4"
              >
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-36 bg-stone-50 rounded-3xl animate-pulse" />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-4"
              >
                {tables.map(table => {
                  const status = getTableStatus(table)
                  const isAvailable = status === 'available'
                  const isOccupied = status === 'occupied'
                  
                  return (
                    <motion.button 
                      key={table.id} 
                      variants={item}
                      onClick={() => handleTableSelect(table)} 
                      disabled={!isAvailable}
                      whileHover={isAvailable ? { y: -4, scale: 1.02 } : {}}
                      whileTap={isAvailable ? { scale: 0.98 } : {}}
                      className={`relative p-5 rounded-3xl border-2 text-left transition-colors duration-300 group
                        ${isAvailable
                          ? 'border-transparent bg-stone-50 hover:bg-orange-50 hover:border-orange-200'
                          : isOccupied
                            ? 'border-amber-100 bg-amber-50/30 opacity-75'
                            : 'border-stone-100 bg-stone-50/50 opacity-50 grayscale'}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-3xl font-display font-black text-stone-800">{table.number}</div>
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                          isAvailable ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 
                          isOccupied ? 'bg-amber-500' : 'bg-stone-300'}`} 
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                          <FiUsers className="text-xs" />
                          <span>{table.capacity} Seats</span>
                        </div>
                        {table.location_label && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            <FiMapPin className="text-xs" />
                            <span className="truncate">{table.location_label}</span>
                          </div>
                        )}
                      </div>

                      {isAvailable && (
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                          <FiChevronRight className="text-orange-500" />
                        </div>
                      )}

                      {isOccupied && (
                        <div className="mt-3 inline-block text-[9px] font-black uppercase tracking-widest text-amber-700 bg-amber-100/50 px-2 py-1 rounded-lg">
                          Occupied
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Footer Decoration */}
      <div className="max-w-md mx-auto px-12 mt-12 text-center opacity-30">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-stone-300 to-transparent w-full mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">ESTD 2024 · Handcrafted Service</p>
      </div>
    </div>
  )
}
