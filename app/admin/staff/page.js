'use client'
// app/admin/staff/page.js — Admin Staff Management
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiX, FiToggleLeft, FiToggleRight } from 'react-icons/fi'

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STAFF', phone: '', pin: '' })

  const fetch_ = async () => {
    try {
      const res = await fetch('/api/staff')
      if (!res.ok) throw new Error('Failed to load staff')
      const data = await res.json()
      setStaff(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Could not load staff')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch_() }, [])

  const openNew = () => { setEditing(null); setForm({ name: '', email: '', password: '', role: 'STAFF', phone: '', pin: '' }); setShowForm(true) }
  const openEdit = (s) => { setEditing(s.id); setForm({ name: s.name || '', email: s.email || '', password: '', role: s.role || 'STAFF', phone: s.phone || '', pin: s.pin || '' }); setShowForm(true) }
  const close = () => { setShowForm(false); setEditing(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const method = editing ? 'PATCH' : 'POST'
      const url = editing ? `/api/staff/${editing}` : '/api/staff'
      const body = { name: form.name, email: form.email, role: form.role, phone: form.phone, pin: form.pin }
      if (form.password) body.password = form.password

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d?.error || 'Action failed')
      }
      toast.success(editing ? 'Staff updated' : 'Staff added')
      close()
      fetch_()
    } catch (err) {
      toast.error(err.message || 'Failed')
    }
  }

  const deleteStaff = async (id) => {
    if (!confirm('Delete this staff member?')) return
    const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); fetch_() }
    else { toast.error('Delete failed') }
  }

  const toggleActive = async (s) => {
    await fetch(`/api/staff/${s.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !s.is_active }) })
    fetch_()
  }

  return (
    <main className="p-8 flex-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-stone-800">Staff</h1>
          <p className="text-stone-500 text-sm">Manage staff accounts and roles</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openNew} className="btn-primary flex items-center gap-2"><FiPlus /> Add Staff</button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-stone-800 text-lg">{editing ? 'Edit Staff' : 'Add Staff'}</h2>
              <button type="button" onClick={close} className="text-stone-400"><FiX /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label">Name</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Password {editing ? '(leave empty to keep)' : ''}</label>
                <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Role</label>
                  <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="STAFF">STAFF</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">PIN</label>
                <input className="input" value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value }))} />
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={close} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="p-8">Loading...</div>
        ) : staff.length === 0 ? (
          <div className="p-8">No staff found</div>
        ) : staff.map(s => (
          <div key={s.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3">
                  <FiUser className="text-stone-400" />
                  <div>
                    <div className="font-bold text-stone-800">{s.name}</div>
                    <div className="text-xs text-stone-500">{s.email}</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={s.is_active ? 'text-green-600 font-semibold' : 'text-stone-400'}>{s.is_active ? 'Active' : 'Inactive'}</div>
                <div className="text-xs text-stone-400">{s.role}</div>
              </div>
            </div>

            {s.role === 'SUPER_ADMIN' ? (
              <div className="text-xs text-stone-400 text-center py-2 bg-stone-50 rounded-xl font-medium">
                🔒 Super Admin (Cannot be modified)
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => toggleActive(s)} className={`p-2 rounded-xl text-xs ${s.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                  {s.is_active ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                </button>
                <button onClick={() => openEdit(s)} className="flex-1 btn-secondary flex items-center justify-center gap-2 text-xs"><FiEdit2 /> Edit</button>
                <button onClick={() => deleteStaff(s.id)} className="bg-red-50 text-red-500 px-3 py-2 rounded-xl text-xs">Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
