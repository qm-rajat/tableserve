'use client'
// app/admin/menu/page.js — Admin menu management
import { useEffect, useState } from 'react'
import { FiPlus, FiTrash2, FiEdit2, FiUploadCloud, FiSearch, FiFilter, FiCheck, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminMenuPage() {
  const [items,      setItems]      = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [isModalOpen,setIsModalOpen]= useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [search,     setSearch]     = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  
  const [formData, setFormData] = useState({
    id: '', name: '', description: '', price: '', category_id: '',
    food_type: 'VEG', is_available: true, image_url: ''
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [iRes, cRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/categories')
      ])
      setItems(await iRes.json())
      setCategories(await cRes.json())
    } catch (err) {
      toast.error('Failed to load menu data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const toastId = toast.loading('Uploading image...')
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFormData({ ...formData, image_url: data.url })
      toast.success('Image uploaded!', { id: toastId })
    } catch (err) {
      toast.error(err.message || 'Upload failed', { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const method = formData.id ? 'PATCH' : 'POST'
    const url    = formData.id ? `/api/menu/${formData.id}` : '/api/menu'
    
    // Convert field names to match API if needed (API uses camelCase in some places or snake_case)
    // Based on previous code, API expects body as is but let's be careful.
    // Actually, looking at the previous patch in the log: fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    // where form was { name, categoryId: item.category_id, ... }
    
    const payload = {
      name: formData.name,
      categoryId: formData.category_id,
      description: formData.description,
      price: parseFloat(formData.price),
      foodType: formData.food_type,
      isAvailable: formData.is_available,
      imageUrl: formData.image_url
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Action failed')
      toast.success(formData.id ? 'Item updated' : 'Item added')
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Item deleted')
      loadData()
    } catch (err) {
      toast.error('Failed to delete item')
    }
  }

  const openEdit = (item) => {
    setFormData({ 
      id: item.id, 
      name: item.name, 
      description: item.description || '', 
      price: item.price, 
      category_id: item.category_id,
      food_type: item.food_type, 
      is_available: item.is_available, 
      image_url: item.image_url || '' 
    })
    setIsModalOpen(true)
  }

  const filteredItems = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      categories.find(c => c.id === i.category_id)?.name.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || i.category_id === categoryFilter;
    
    return matchesSearch && matchesCategory;
  })

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-display font-black text-stone-800">Menu Management</h1>
          <p className="text-stone-500 text-sm">Create and organize your cafe's delights</p>
        </div>
        <button 
          onClick={() => { setFormData({ id: '', name: '', description: '', price: '', category_id: categories[0]?.id || '', food_type: 'VEG', is_available: true, image_url: '' }); setIsModalOpen(true) }}
          className="btn-primary flex items-center gap-2 justify-center shadow-orange-500/20"
        >
          <FiPlus /> Add New Item
        </button>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search by name or category..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-12 h-14"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative min-w-[200px]">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input pl-12 h-14 appearance-none pr-10 cursor-pointer font-semibold text-stone-600"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredItems.map(item => (
            <motion.div 
              layout
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card group hover:shadow-2xl hover:shadow-orange-900/5 transition-all duration-500 flex flex-col h-full"
            >
              <div className="relative h-56 -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-3xl bg-stone-50">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                    <FiImage size={48} className="text-stone-400 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">No Image</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-stone-800 shadow-sm border border-white/50">
                  {categories.find(c => c.id === item.category_id)?.name || 'General'}
                </div>
                {!item.is_available && (
                  <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-white text-stone-900 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Out of Stock</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-start mb-2">
                <h3 className="font-display font-black text-2xl text-stone-800 leading-tight group-hover:text-orange-600 transition-colors">{item.name}</h3>
                <span className="font-black text-orange-600 text-xl tracking-tight">₹{item.price}</span>
              </div>
              <p className="text-stone-400 text-xs line-clamp-2 mb-8 leading-relaxed flex-1">
                {item.description || 'No description provided.'}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-stone-100 mt-auto">
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="p-3 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all">
                    <FiEdit2 size={18} />
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                    <FiTrash2 size={18} />
                  </button>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  item.food_type === 'VEG' ? 'bg-green-50 text-green-700 border-green-100' : 
                  item.food_type === 'NON_VEG' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-stone-50 text-stone-700 border-stone-100'
                }`}>
                  {item.food_type.replace('_', ' ')}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-40 opacity-30">
          <FiSearch size={64} className="mx-auto mb-6 text-stone-300" />
          <h2 className="text-2xl font-display font-black text-stone-500">No items found</h2>
          <p className="text-stone-400">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Item Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
            >
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="p-8 sm:p-10 border-b border-stone-100 flex items-center justify-between bg-white z-10 shrink-0">
                  <div>
                    <h2 className="text-3xl font-display font-black text-stone-800">{formData.id ? 'Edit Secret Recipe' : 'Add New Delight'}</h2>
                    <p className="text-stone-400 text-xs">Craft the perfect experience for your customers</p>
                  </div>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-4 bg-stone-50 rounded-2xl hover:bg-stone-100 transition-all text-stone-400 hover:text-stone-800"><FiX size={20} /></button>
                </div>

                <div className="p-8 sm:p-10 overflow-y-auto space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
                    {/* Image Column */}
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 block mb-3">Item Visual</label>
                      <div className="relative group aspect-square rounded-[2.5rem] bg-stone-50 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center overflow-hidden hover:border-orange-300 transition-all cursor-pointer">
                        {formData.image_url ? (
                          <>
                            <Image src={formData.image_url} alt="Preview" fill className="object-cover" />
                            <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                              <label className="bg-white text-stone-900 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest cursor-pointer shadow-2xl active:scale-95 transition-all">
                                Change Image
                                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                              </label>
                            </div>
                          </>
                        ) : (
                          uploading ? (
                            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 text-center bg-stone-50/50">
                              <div className="w-16 h-16 bg-white rounded-3xl shadow-md flex items-center justify-center text-stone-300 mb-4 group-hover:scale-110 group-hover:text-orange-500 transition-all duration-500">
                                <FiUploadCloud size={32} />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Tap to upload item image</span>
                              <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                            </label>
                          )
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 mt-4 leading-relaxed text-center italic">Best suited with a square 1:1 ratio. Max size 2MB.</p>
                    </div>

                    {/* Details Column */}
                    <div className="md:col-span-3 space-y-6">
                      <div>
                        <label className="label">Item Name</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="input h-14 text-base" placeholder="e.g. Signature Cold Brew" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Price (₹)</label>
                          <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required className="input h-14" placeholder="0.00" />
                        </div>
                        <div>
                          <label className="label">Category</label>
                          <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} required className="input h-14 appearance-none">
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="label">Food Type</label>
                        <div className="flex p-1 bg-stone-100 rounded-2xl gap-1">
                          {['VEG', 'NON_VEG', 'VEGAN'].map(type => (
                            <button 
                              key={type}
                              type="button"
                              onClick={() => setFormData({ ...formData, food_type: type })}
                              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                formData.food_type === type ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                              }`}
                            >
                              {type.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="label">Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input h-32 resize-none py-4 leading-relaxed" placeholder="Describe the flavors, ingredients, or story behind this item..." />
                      </div>

                      <div className="flex items-center gap-4 p-5 bg-stone-50 rounded-[1.5rem] border border-stone-100 group transition-all hover:bg-orange-50/30 hover:border-orange-100">
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            id="avail-check" 
                            className="hidden" 
                            checked={formData.is_available} 
                            onChange={e => setFormData({ ...formData, is_available: e.target.checked })} 
                          />
                          <div 
                            className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${formData.is_available ? 'bg-green-500' : 'bg-stone-200'}`}
                            onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}
                          >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm ${formData.is_available ? 'translate-x-6' : ''}`} />
                          </div>
                        </div>
                        <label htmlFor="avail-check" className="text-sm font-black text-stone-700 cursor-pointer select-none">Currently Available for Ordering</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 sm:p-10 bg-stone-50 flex items-center justify-center sm:justify-end gap-6 shrink-0 mt-auto border-t border-stone-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-xs font-black uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-all">Dismiss</button>
                  <button type="submit" disabled={uploading} className="btn-primary min-w-[200px] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed text-base py-5">
                    {formData.id ? <FiCheck size={20} /> : <FiPlus size={20} />}
                    <span className="font-black uppercase tracking-widest">{formData.id ? 'Save Changes' : 'Publish Item'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
