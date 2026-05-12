'use client'
// app/admin/menu/page.js
import { useEffect, useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiUpload } from 'react-icons/fi'

const FOOD_TYPES = ['VEG', 'NON_VEG', 'VEGAN']
const FOOD_BADGE = { VEG: '🟢', NON_VEG: '🔴', VEGAN: '🌿' }
const emptyForm  = { name: '', categoryId: '', description: '', price: '', foodType: 'VEG', isAvailable: true, imageUrl: '' }

export default function AdminMenu() {
  const [items,      setItems]      = useState([])
  const [categories, setCategories] = useState([])
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState(emptyForm)
  const [uploading,  setUploading]  = useState(false)
  const [filterCat,  setFilterCat]  = useState('')

  const fetch_ = () => Promise.all([
    fetch('/api/menu').then(r => r.json()),
    fetch('/api/categories').then(r => r.json()),
  ]).then(([m, c]) => { setItems(m); setCategories(c) })

  useEffect(() => { fetch_() }, [])

  const openEdit = (item) => {
    setEditing(item.id)
    setForm({ name: item.name, categoryId: item.category_id, description: item.description || '', price: item.price, foodType: item.food_type, isAvailable: item.is_available, imageUrl: item.image_url || '' })
    setShowForm(true)
  }
  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true) }
  const close   = () => { setShowForm(false); setEditing(null) }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res  = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setForm(f => ({ ...f, imageUrl: data.url }))
    else toast.error('Upload failed')
    setUploading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const method = editing ? 'PATCH' : 'POST'
    const url    = editing ? `/api/menu/${editing}` : '/api/menu'
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { toast.success(editing ? 'Item updated' : 'Item added'); close(); fetch_() }
    else { const d = await res.json(); toast.error(d.error) }
  }

  const deleteItem = async (id) => {
    if (!confirm('Delete this menu item?')) return
    const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Item deleted'); fetch_() }
    else toast.error('Failed to delete')
  }

  const toggleAvailable = async (item) => {
    await fetch(`/api/menu/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isAvailable: !item.is_available }) })
    fetch_()
  }

  const filtered = filterCat ? items.filter(i => i.category_id === filterCat) : items

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-stone-800">Menu Items</h1>
          <p className="text-stone-500 text-sm">{items.length} items</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm"><FiPlus /> Add Item</button>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        <button onClick={() => setFilterCat('')} className={`px-4 py-1.5 rounded-full text-sm font-semibold ${!filterCat ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-600'}`}>All</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setFilterCat(c.id)} className={`px-4 py-1.5 rounded-full text-sm font-semibold ${filterCat === c.id ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-600'}`}>{c.name}</button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl my-4">
            <h2 className="font-bold text-stone-800 text-lg mb-4">{editing ? 'Edit Item' : 'Add Menu Item'}</h2>
            <div className="space-y-3">
              <div><label className="label">Name *</label><input type="text" className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label className="label">Category *</label>
                <select className="input" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className="label">Description</label><textarea className="input resize-none h-16" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Price (₹) *</label><input type="number" step="0.01" className="input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required /></div>
                <div><label className="label">Food Type</label>
                  <select className="input" value={form.foodType} onChange={e => setForm(f => ({ ...f, foodType: e.target.value }))}>
                    {FOOD_TYPES.map(t => <option key={t} value={t}>{FOOD_BADGE[t]} {t.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Image</label>
                <div className="flex gap-2 items-center">
                  <input type="text" className="input" placeholder="Image URL or upload below" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
                  <label className="shrink-0 btn-secondary text-xs py-2 px-3 cursor-pointer flex items-center gap-1">
                    <FiUpload /> {uploading ? '...' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
                {form.imageUrl && <div className="mt-2 relative w-16 h-16 rounded-xl overflow-hidden"><Image src={form.imageUrl} alt="" fill className="object-cover" /></div>}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="avail" checked={form.isAvailable} onChange={e => setForm(f => ({ ...f, isAvailable: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
                <label htmlFor="avail" className="text-sm text-stone-700">Available on menu</label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={close} className="flex-1 btn-secondary text-sm">Cancel</button>
              <button type="submit" className="flex-1 btn-primary text-sm">{editing ? 'Update' : 'Add Item'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div key={item.id} className={`card ${!item.is_available ? 'opacity-60' : ''}`}>
            <div className="flex gap-3">
              {item.image_url
                ? <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0"><Image src={item.image_url} alt={item.name} fill className="object-cover" /></div>
                : <div className="w-16 h-16 bg-stone-100 rounded-xl flex items-center justify-center text-2xl shrink-0">🍽️</div>
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <p className="font-bold text-stone-800 text-sm leading-tight">{FOOD_BADGE[item.food_type]} {item.name}</p>
                  <button onClick={() => toggleAvailable(item)} className={`shrink-0 ${item.is_available ? 'text-green-500' : 'text-stone-300'}`}>
                    {item.is_available ? <FiToggleRight className="text-xl" /> : <FiToggleLeft className="text-xl" />}
                  </button>
                </div>
                <p className="text-xs text-stone-400 mt-0.5 truncate">{item.description}</p>
                <p className="font-black text-orange-600 mt-1">₹{item.price}</p>
                <p className="text-xs text-stone-400">{item.category?.name}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-1.5 text-xs btn-secondary py-2"><FiEdit2 /> Edit</button>
              <button onClick={() => deleteItem(item.id)} className="flex items-center justify-center gap-1.5 text-xs bg-red-50 text-red-500 hover:bg-red-100 px-3 py-2 rounded-xl"><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
