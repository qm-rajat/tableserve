'use client'
// app/admin/categories/page.js
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiChevronUp, FiChevronDown, FiImage, FiX } from 'react-icons/fi'
import Image from 'next/image'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Could not load categories')
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Unable to load categories')
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openNew = () => {
    setEditing(null)
    setName('')
    setImageUrl('')
    setShowForm(true)
  }

  const openEdit = (category) => {
    setEditing(category.id)
    setName(category.name || '')
    setImageUrl(category.image_url || '')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    const toastId = toast.loading('Uploading image...')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setImageUrl(data.url)
      toast.success('Image uploaded', { id: toastId })
    } catch (error) {
      toast.error(error.message || 'Upload failed', { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  const saveCategory = async (event) => {
    event.preventDefault()
    try {
      const method = editing ? 'PATCH' : 'POST'
      const url = editing ? `/api/categories/${editing}` : '/api/categories'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, imageUrl }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }
      toast.success(editing ? 'Category updated' : 'Category created')
      closeForm()
      fetchCategories()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteCategoryItem = async (id) => {
    if (!confirm('Delete this category?')) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Category removed')
      fetchCategories()
    } else {
      toast.error('Delete failed')
    }
  }

  const reorderCategory = async (category, direction) => {
    const index = categories.findIndex((item) => item.id === category.id)
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= categories.length) return
    const nextCategory = categories[targetIndex]
    await Promise.all([
      fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: nextCategory.sort_order }),
      }),
      fetch(`/api/categories/${nextCategory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: category.sort_order }),
      }),
    ])
    fetchCategories()
  }

  return (
    <main className="p-8 flex-1">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-stone-900">Categories</h1>
            <p className="text-sm text-stone-500">Manage category names, images, and ordering.</p>
          </div>
          <button type="button" onClick={openNew} className="btn-primary">
            <FiPlus /> Add Category
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <form onSubmit={saveCategory} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-stone-900">{editing ? 'Edit Category' : 'New Category'}</h2>
                  <p className="text-sm text-stone-500">Update category details for the menu.</p>
                </div>
                <button type="button" onClick={closeForm} className="text-stone-400 hover:text-stone-600">Cancel</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="input w-full" required />
                </div>

                <div>
                  <label className="label">Image</label>
                  <div className="relative rounded-2xl border border-stone-200 bg-stone-50 p-4 text-center">
                    {imageUrl ? (
                      <>
                        <Image src={imageUrl} alt="Category" fill className="object-cover rounded-2xl" />
                        <button type="button" onClick={() => setImageUrl('')} className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white">
                          <FiX size={14} />
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer text-stone-500">
                        Upload image
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" disabled={uploading} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={closeForm} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={uploading} className="btn-primary flex-1">{editing ? 'Save' : 'Create'}</button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {categories.map((category, index) => (
            <div key={category.id} className="card flex items-center gap-4 p-4">
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => reorderCategory(category, 'up')} disabled={index === 0} className="text-stone-400 hover:text-stone-700 disabled:opacity-40">↑</button>
                <button type="button" onClick={() => reorderCategory(category, 'down')} disabled={index === categories.length - 1} className="text-stone-400 hover:text-stone-700 disabled:opacity-40">↓</button>
              </div>
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-stone-100">
                {category.image_url ? (
                  <Image src={category.image_url} alt={category.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-stone-400">No image</div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-stone-900">{category.name}</p>
                <p className="text-xs text-stone-500">{category.menu_items?.length || 0} items</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => openEdit(category)} className="btn-secondary text-xs">Edit</button>
                <button type="button" onClick={() => deleteCategoryItem(category.id)} className="btn-danger text-xs">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
