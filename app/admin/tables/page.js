'use client'
// app/admin/tables/page.js
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi'

export default function AdminTables() {
  const [tables,   setTables]   = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState({ number: '', capacity: '', locationLabel: '' })

  const fetch_ = () => fetch('/api/tables').then(r => r.json()).then(setTables)
  useEffect(() => { fetch_() }, [])

  const openEdit = (t) => { setEditing(t.id); setForm({ number: t.number, capacity: t.capacity, locationLabel: t.location_label || '' }); setShowForm(true) }
  const openNew  = () => { setEditing(null); setForm({ number: '', capacity: '', locationLabel: '' }); setShowForm(true) }
  const close    = () => { setShowForm(false); setEditing(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const method = editing ? 'PATCH' : 'POST'
    const url    = editing ? `/api/tables/${editing}` : '/api/tables'
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { toast.success(editing ? 'Table updated' : 'Table added'); close(); fetch_() }
    else { const d = await res.json(); toast.error(d.error) }
  }

  const deleteTable = async (id) => {
    if (!confirm('Delete this table?')) return
    const res = await fetch(`/api/tables/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Table deleted'); fetch_() }
    else toast.error('Cannot delete table with existing orders')
  }

  const toggleActive = async (t) => {
    await fetch(`/api/tables/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !t.is_active }) })
    fetch_()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-stone-800">Tables</h1>
          <p className="text-stone-500 text-sm">{tables.length} tables configured</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm"><FiPlus /> Add Table</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="font-bold text-stone-800 text-lg mb-4">{editing ? 'Edit Table' : 'Add New Table'}</h2>
            <div className="space-y-4">
              <div><label className="label">Table Number</label><input type="number" className="input" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} required /></div>
              <div><label className="label">Seating Capacity</label><input type="number" className="input" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} required /></div>
              <div><label className="label">Location Label</label><input type="text" className="input" placeholder="e.g. Window Side" value={form.locationLabel} onChange={e => setForm(f => ({ ...f, locationLabel: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={close} className="flex-1 btn-secondary text-sm">Cancel</button>
              <button type="submit" className="flex-1 btn-primary text-sm">{editing ? 'Update' : 'Add Table'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map(t => (
          <div key={t.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-3xl font-black text-stone-800">{t.number}</span>
                <p className="text-xs text-stone-400">{t.location_label || 'No location'}</p>
              </div>
              <button onClick={() => toggleActive(t)} className={`p-1 rounded-lg ${t.is_active ? 'text-green-500' : 'text-stone-300'}`}>
                {t.is_active ? <FiToggleRight className="text-2xl" /> : <FiToggleLeft className="text-2xl" />}
              </button>
            </div>
            <p className="text-sm text-stone-600 mb-4">👥 {t.capacity} seats · <span className={t.is_active ? 'text-green-600 font-semibold' : 'text-stone-400'}>{t.is_active ? 'Active' : 'Inactive'}</span></p>
            <div className="flex gap-2">
              <button onClick={() => openEdit(t)} className="flex-1 flex items-center justify-center gap-1.5 text-xs btn-secondary py-2"><FiEdit2 /> Edit</button>
              <button onClick={() => deleteTable(t.id)} className="flex items-center justify-center gap-1.5 text-xs bg-red-50 text-red-500 hover:bg-red-100 px-3 py-2 rounded-xl"><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
