'use client'
// app/page.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiUsers, FiMapPin } from 'react-icons/fi'
import { MdTableRestaurant } from 'react-icons/md'

export default function HomePage() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/tables')
      .then(r => r.json())
      .then(data => { setTables(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => { setTables([]); setLoading(false) })
  }, [])

  const handleTableSelect = (table) => {
    if (!table.isActive) return
    router.push(`/order?table=${table.id}&tableNum=${table.number}`)
  }

  const getTableStatus = (table) => {
    if (!table.isActive) return 'inactive'
    if (table.orders?.length > 0) return 'occupied'
    return 'available'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <MdTableRestaurant className="text-white text-xl" />
          </div>
          <div>
            <h1 className="font-bold text-stone-800 text-lg leading-tight">TableServe</h1>
            <p className="text-xs text-stone-500">Select your table to begin</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-stone-800 mb-1">Choose a Table</h2>
          <p className="text-stone-500 text-sm">Tap an available table to view our menu</p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-5 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>Available</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>Occupied</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-stone-300 inline-block"></span>Inactive</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-stone-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {tables.map(table => {
              const status = getTableStatus(table)
              const isClickable = status === 'available'
              return (
                <button
                  key={table.id}
                  onClick={() => handleTableSelect(table)}
                  disabled={!isClickable}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 
                    ${isClickable
                      ? 'border-green-200 bg-white hover:border-orange-400 hover:shadow-md active:scale-95 cursor-pointer'
                      : status === 'occupied'
                        ? 'border-amber-200 bg-amber-50 cursor-not-allowed opacity-75'
                        : 'border-stone-200 bg-stone-50 cursor-not-allowed opacity-50'
                    }`}
                >
                  <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${
                    status === 'available' ? 'bg-green-400' :
                    status === 'occupied' ? 'bg-amber-400' : 'bg-stone-300'
                  }`} />

                  <div className="text-3xl font-black text-stone-800 mb-2">{table.number}</div>
                  <div className="flex items-center gap-1 text-xs text-stone-500 mb-1">
                    <FiUsers className="text-xs" />
                    <span>{table.capacity} seats</span>
                  </div>
                  {table.locationLabel && (
                    <div className="flex items-center gap-1 text-xs text-stone-400">
                      <FiMapPin className="text-xs" />
                      <span>{table.locationLabel}</span>
                    </div>
                  )}
                  {status === 'occupied' && (
                    <span className="mt-2 inline-block text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Occupied</span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
