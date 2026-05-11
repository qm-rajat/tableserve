'use client'
// app/admin/categories/page.js
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiChevronUp, FiChevronDown } from 'react-icons/fi'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')

  const fetch_ = () => fetch('/api/categories').then(r => r.json()).then(setCategories)
  useEffect(() => { fetch_() }, [])

  const openEdit = (c) => { setEditing(c.id); setName(c.name); setShowForm(true) }
  const openNew = () => { setEditing(null); setName(''); setShowForm(true) }
  const close = () => { setShowForm(false); setEditing(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const method = editing ? 'PATCH' : 'POST'
    const url = editing ? `/api/categories/${editing}` : '/api/categories'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    if (res.ok) { toast.success(editing ? 'Updated' : 'Category added'); close(); fetch_() }
    else { const d = await res.json(); toast.error(d.error) }
  }

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category? Items in it must be reassigned first.')) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); fetch_() }
    else toast.error('Delete failed — category may have items')
  }

  const reorder = async (cat, direction) => {
    const idx = categories.findIndex(c => c.id === cat.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= categories.length) return
    const swap = categories[swapIdx]
    await Promise.all([
      fetch(`/api/categories/${cat.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: swap.sortOrder }) }),
      fetch(`/api/categories/${swap.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: cat.sortOrder }) }),
    ])
    fetch_()
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-stone-800">Categories</h1>
          <p className="text-stone-500 text-sm">{categories.length} categories</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="font-bold text-stone-800 text-lg mb-4">{editing ? 'Edit Category' : 'Add Category'}</h2>
            <div className="mb-4"><label className="label">Name</label><input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required autoFocus /></div>
            <div className="flex gap-3">
              <button type="button" onClick={close} className="flex-1 btn-secondary text-sm">Cancel</button>
              <button type="submit" className="flex-1 btn-primary text-sm">Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((cat, i) => (
          <div key={cat.id} className="card flex items-center gap-4">
            <div className="flex flex-col gap-0.5">
              <button onClick={() => reorder(cat, 'up')} disabled={i === 0} className="text-stone-300 hover:text-stone-600 disabled:opacity-20"><FiChevronUp /></button>
              <button onClick={() => reorder(cat, 'down')} disabled={i === categories.length - 1} className="text-stone-300 hover:text-stone-600 disabled:opacity-20"><FiChevronDown /></button>
            </div>
            <span className="text-stone-400 text-sm w-6 text-center">#{i + 1}</span>
            <div className="flex-1">
              <p className="font-bold text-stone-800">{cat.name}</p>
              <p className="text-xs text-stone-400">{cat._count?.menuItems || 0} items</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(cat)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><FiEdit2 /></button>
              <button onClick={() => deleteCategory(cat.id)} className="bg-red-50 text-red-500 hover:bg-red-100 text-xs py-1.5 px-3 rounded-xl"><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
