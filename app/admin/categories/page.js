'use client'
// app/admin/categories/page.js
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiChevronUp, FiChevronDown, FiImage, FiX } from 'react-icons/fi'
import Image from 'next/image'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [name,       setName]       = useState('')
  const [imageUrl,   setImageUrl]   = useState('')
  const [uploading,  setUploading]  = useState(false)

  const fetch_ = () => fetch('/api/categories').then(r => r.json()).then(setCategories)
  useEffect(() => { fetch_() }, [])

  const openEdit = (c) => { 
    setEditing(c.id); 
    setName(c.name); 
    setImageUrl(c.image_url || '');
    setShowForm(true) 
  }
  const openNew  = () => { 
    setEditing(null); 
    setName(''); 
    setImageUrl('');
    setShowForm(true) 
  }
  const close    = () => { setShowForm(false); setEditing(null) }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const toastId = toast.loading('Uploading image...')
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setImageUrl(data.url)
      toast.success('Image uploaded', { id: toastId })
    } catch (err) {
      toast.error('Upload failed', { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const method = editing ? 'PATCH' : 'POST'
    const url    = editing ? `/api/categories/${editing}` : '/api/categories'
    const res    = await fetch(url, { 
      method, 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ name, imageUrl }) 
    })
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
    const idx     = categories.findIndex(c => c.id === cat.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= categories.length) return
    const swap = categories[swapIdx]
    await Promise.all([
      fetch(`/api/categories/${cat.id}`,  { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: swap.sort_order }) }),
      fetch(`/api/categories/${swap.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: cat.sort_order }) }),
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
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm"><FiPlus /> Add Category</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
            <h2 className="font-bold text-stone-800 text-lg mb-4">{editing ? 'Edit Category' : 'Add Category'}</h2>
            
            <div className="mb-4">
              <label className="label">Category Image</label>
              <div className="relative aspect-video rounded-xl bg-stone-50 border-2 border-dashed border-stone-100 flex flex-col items-center justify-center overflow-hidden">
                {imageUrl ? (
                  <>
                    <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70 backdrop-blur-sm transition-all"
                    >
                      <FiX size={14} />
                    </button>
                  </>
                ) : (
                  <div className="text-center px-4">
                    <FiImage size={24} className="mx-auto text-stone-300 mb-2" />
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </p>
                    <input 
                      type="file" 
                      onChange={handleImageUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      accept="image/*"
                      disabled={uploading}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="label">Name</label>
              <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required autoFocus />
            </div>
            
            <div className="flex gap-3">
              <button type="button" onClick={close} className="flex-1 btn-secondary text-sm">Cancel</button>
              <button type="submit" disabled={uploading} className="flex-1 btn-primary text-sm">
                {uploading ? 'Please wait...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((cat, i) => (
          <div key={cat.id} className="card flex items-center gap-4 group">
            <div className="flex flex-col gap-0.5">
              <button onClick={() => reorder(cat, 'up')}   disabled={i === 0}                      className="text-stone-300 hover:text-stone-600 disabled:opacity-20"><FiChevronUp /></button>
              <button onClick={() => reorder(cat, 'down')} disabled={i === categories.length - 1} className="text-stone-300 hover:text-stone-600 disabled:opacity-20"><FiChevronDown /></button>
            </div>
            
            <div className="relative w-12 h-12 rounded-xl bg-stone-50 overflow-hidden shrink-0 border border-stone-100 italic">
              {cat.image_url ? (
                <Image src={cat.image_url} alt={cat.name} fill className="object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-stone-300">No Image</div>
              )}
            </div>

            <div className="flex-1">
              <p className="font-bold text-stone-800">{cat.name}</p>
              <p className="text-xs text-stone-400">{cat.menu_items?.length || 0} items</p>
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
